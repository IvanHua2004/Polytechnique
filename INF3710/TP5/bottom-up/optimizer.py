from itertools import combinations

from utils import (
    CATALOG,
    Catalog,
    CostModel,
    FilterPlan,
    FilterPredicate,
    Plan,
    Query,
    QueryTable,
    get_possible_scan_plans,
    join_candidates,
    legal_join_choice,
)


def calculate_filter_score(predicate: FilterPredicate) -> float:
    """Return a score that tells `order_filters` when to run this filter.

    Running a cheap filter that removes many rows early reduces the work done
    by later filters. `selectivity` is the fraction of rows expected to pass.
    Balance the filter's cost and selectivity with:

        predicate.evaluation_cost / (1 - predicate.selectivity)

    Lower scores run first. What does a selectivity of 1 mean, and in what
    order should these predicates run?
    """
    if predicate.selectivity >= 1:
        return float("inf")
    return predicate.evaluation_cost / (1 - predicate.selectivity)


def order_filters(
    predicates: tuple[FilterPredicate, ...],
) -> tuple[FilterPredicate, ...]:
    """Return the filters in the order in which they should run.

    Use `calculate_filter_score` to compare filters, with lower scores first.
    If two filters have the same score, compare their SQL text so the result is
    predictable. Make sure to return a new tuple without changing the input.
    """
    return tuple(
        sorted(predicates, key=lambda p: (calculate_filter_score(p), p.sql))
    )


def _apply_filters(plan: Plan, predicates: tuple[FilterPredicate, ...]) -> Plan:
    """Provided: add every filter in the order selected."""
    for predicate in order_filters(predicates):
        plan = FilterPlan(plan, predicate)
    return plan


def choose_best_access_plan(
    table: QueryTable,
    predicates: tuple[FilterPredicate, ...],
    required_columns: tuple[str, ...],
    cost_model: CostModel,
    catalog: Catalog = CATALOG,
) -> Plan:
    """Return the cheapest complete plan for reading one table.

    Before joining tables, the optimizer must decide how each table should be
    read. It may read the table sequentially or use an index. The best choice
    depends on the table's filters and on the columns the query needs.

    Start by calling `get_possible_scan_plans` to obtain every scan that can be
    used for this table. `required_columns` already contains the columns that
    each scan must return.

    Some index scans apply one filter while reading the table. Add every filter that was not already
    applied (maybe `ScanPlan` already has a flag that you can use?) so, we do not add the same
    filter twice. `_apply_filters` can add those remaining filters in the chosen order.

    Compare the complete scan-and-filter plans with `cost_model.estimate`. Choose the lowest cost,
    then the fewest output rows and then as a tie breaker, use `repr(plan)`so equal plans always
    produce the same result.
    """
    best_plan = None
    best_key = None
    for scan in get_possible_scan_plans(table, predicates, required_columns, catalog):
        remaining = list(predicates)
        if scan.filter_applied_by_scan_index is not None:
            remaining.remove(scan.filter_applied_by_scan_index)
        plan = _apply_filters(scan, tuple(remaining))
        estimate = cost_model.estimate(plan)
        key = (estimate.cost, estimate.rows, repr(plan))
        if best_key is None or key < best_key:
            best_plan, best_key = plan, key
    return best_plan


def build_base_plans(
    query: Query,
    cost_model: CostModel,
    catalog: Catalog = CATALOG,
) -> dict[frozenset[str], Plan]:
    """Create the one-table entries in `subquery_to_best_plan_map`.

    This map is the memory used by the dynamic-programming algorithm. Each key is a group of table
    names. Its value is the cheapest `Plan` found for reading and joining exactly those tables.

    For a query joining `customers c` and `orders o`, this function creates:

        frozenset({"c"}) -> cheapest scan-and-filter plan for customers
        frozenset({"o"}) -> cheapest scan-and-filter plan for orders

    The value stored under `frozenset({"c"})` is the complete one-table `Plan`. It contains the
    chosen scan method, the columns to read, and all filters for `c`.
    For example, it may be an index scan on `customers_region_idx` with the filter `c.region = 'QC'`.

    Later, `optimize` uses these plans to create:

        frozenset({"c", "o"}) -> cheapest plan joining both tables

    Dynamic programming must solve the one-table groups first because every larger plan is built
    from smaller plans already stored in this map. For each table, this function keeps the filters
    that may safely run before the joins and calls `choose_best_access_plan` to find the plan to
    store. """
    subquery_to_best_plan_map: dict[frozenset[str], Plan] = {}
    for table in query.tables:
        # Keep only early filters that belong to this table.
        filters_for_table = tuple(
            predicate
            for predicate in query.pushable_filters
            if predicate.column.table_name == table.name
        )

        # A one-table group is the starting subquery for the DP algorithm.
        table_group = frozenset((table.name,))
        subquery_to_best_plan_map[table_group] = choose_best_access_plan(
            table,
            filters_for_table,
            query.required_columns(table.name),
            cost_model,
            catalog,
        )
    return subquery_to_best_plan_map


def enumerate_partitions(
    table_names: frozenset[str],
) -> tuple[tuple[frozenset[str], frozenset[str]], ...]:
    """Return every way to split a table group into left and right groups.

    The DP algorithm builds a larger plan by joining two smaller plans already
    stored in `subquery_to_best_plan_map`. This function provides every split
    that the optimizer must try. Neither side may be empty.

    For `{a, b, c}`, include both `({a}, {b, c})` and `({b, c}, {a})`
    because changing the two sides can change the cost. `combinations` can
    generate each left side. Sort the table names first for predictable output.
    """
    names = sorted(table_names)
    partitions = []
    for size in range(1, len(names)):
        for left in combinations(names, size):
            left_names = frozenset(left)
            partitions.append((left_names, table_names - left_names))
    return tuple(partitions)


def find_best_plan_for_table_subset(
    query: Query,
    table_names: frozenset[str],
    subquery_to_best_plan_map: dict[frozenset[str], Plan],
    cost_model: CostModel,
    catalog: Catalog = CATALOG,
) -> Plan | None:
    """Return the cheapest plan for one group of tables.

    This function calculates one value for `subquery_to_best_plan_map`. For
    each split from `enumerate_partitions`, first check that both smaller plans
    are already stored in the map.

    Use `legal_join_choice` to check whether those plans may be joined. If they
    can, use `join_candidates` to obtain the possible ways to join them.
    Compare all complete plans with `cost_model.estimate`: lowest cost first,
    then fewest output rows, then `repr(plan)` for predictable ties.

    Return `None` if no split can legally build this table group.
    """
    best_plan = None
    best_key = None
    for left_names, right_names in enumerate_partitions(table_names):
        if left_names not in subquery_to_best_plan_map:
            continue
        if right_names not in subquery_to_best_plan_map:
            continue
        choice = legal_join_choice(query, left_names, right_names)
        if choice is None:
            continue
        left_plan = subquery_to_best_plan_map[left_names]
        right_plan = subquery_to_best_plan_map[right_names]
        for plan in join_candidates(left_plan, right_plan, choice, catalog):
            estimate = cost_model.estimate(plan)
            key = (estimate.cost, estimate.rows, repr(plan))
            if best_key is None or key < best_key:
                best_plan, best_key = plan, key
    return best_plan


def optimize(query: Query, catalog: Catalog = CATALOG) -> Plan:
    """Build the cheapest plan for the complete query.

    `build_base_plans` creates the first map entries, one for each table. Then
    process groups containing 2 tables, 3 tables, and so on. `combinations`
    can generate every group of a given size. Call
    `find_best_plan_for_table_subset` for each group and store every result
    that is not `None`.

    The map entry containing all query tables is the final join plan. Raise
    `ValueError` if it was never built. Before returning it, use
    `_apply_filters` to add `query.residual_filters`, which could not safely
    run before the joins.
    """
    cost_model = CostModel(query, catalog)
    subquery_to_best_plan_map = build_base_plans(query, cost_model, catalog)
    all_names = sorted(query.table_names)
    for size in range(2, len(all_names) + 1):
        for group in combinations(all_names, size):
            table_names = frozenset(group)
            plan = find_best_plan_for_table_subset(
                query, table_names, subquery_to_best_plan_map, cost_model, catalog
            )
            if plan is not None:
                subquery_to_best_plan_map[table_names] = plan
    full = query.table_names
    if full not in subquery_to_best_plan_map:
        raise ValueError("No legal plan covers every table in the query")
    return _apply_filters(subquery_to_best_plan_map[full], query.residual_filters)
