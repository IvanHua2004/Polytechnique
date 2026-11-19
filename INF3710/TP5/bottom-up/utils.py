from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from enum import Enum
from math import ceil

from sqlglot import exp, parse_one
from sqlglot.errors import ParseError


class UnsupportedQuery(ValueError):
    """Raised when a query is outside the TP5 SQL subset."""

    pass


class InvalidPlan(ValueError):
    """Raised when an optimizer returns an invalid physical plan."""

    pass


class JoinType(str, Enum):
    INNER = "INNER"
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    FULL = "FULL"
    CROSS = "CROSS"


class ScanMethod(str, Enum):
    SEQUENTIAL = "SEQUENTIAL_SCAN"
    INDEX = "INDEX_SCAN"
    INDEX_ONLY = "INDEX_ONLY_SCAN"
    INDEX_LOOKUP = "INDEX_LOOKUP"


class JoinMethod(str, Enum):
    HASH = "HASH_JOIN"
    NESTED_LOOP = "NESTED_LOOP_JOIN"
    INDEX_NESTED_LOOP = "INDEX_NESTED_LOOP_JOIN"


@dataclass(frozen=True)
class ColumnStats:
    distinct_values: int
    # average size of the column in bytes
    average_size: int


@dataclass(frozen=True)
class IndexStats:
    """Catalog statistics for one index.

    `height` is the estimated number of B-tree levels visited by one point
    lookup. It belongs to the catalog because it can differ between indexes.
    The sample catalog's value of 3 is a teaching approximation for a shallow
    B-tree, not a measured DuckDB value. `included_columns` are stored in the
    index but are not search keys.
    """

    name: str
    key_columns: tuple[str, ...]
    height: int
    included_columns: tuple[str, ...] = ()

    @property
    def stored_columns(self) -> frozenset[str]:
        return frozenset(self.key_columns + self.included_columns)

    def covers(self, required_columns: tuple[str, ...]) -> bool:
        """Return whether the index contains every required column."""
        return set(required_columns).issubset(self.stored_columns)


@dataclass(frozen=True)
class TableStats:
    rows: int
    columns: dict[str, ColumnStats]
    indexes: tuple[IndexStats, ...] = ()


@dataclass(frozen=True)
class Catalog:
    """Statistics given to the optimizer."""

    tables: dict[str, TableStats]

    def table(self, name: str) -> TableStats:
        """Return one table's statistics, using a case-insensitive name."""
        try:
            return self.tables[name.lower()]
        except KeyError as error:
            raise UnsupportedQuery(f"Unknown table: {name}") from error

    def index_on(self, table: str, column: str) -> IndexStats | None:
        """Return the first index searchable by the given column."""
        for index in self.table(table).indexes:
            if index.key_columns and index.key_columns[0] == column.lower():
                return index
        return None

    def index_named(self, table: str, name: str) -> IndexStats | None:
        """Return an index by name, or `None` if the table has no such index."""
        for index in self.table(table).indexes:
            if index.name == name:
                return index
        return None


CATALOG = Catalog(
    tables={
        "customers": TableStats(
            rows=1_000_000,
            columns={
                "customer_id": ColumnStats(1_000_000, 8),
                "region": ColumnStats(20, 4),
                "active": ColumnStats(2, 1),
                "name": ColumnStats(950_000, 32),
            },
            indexes=(
                IndexStats("customers_pk", ("customer_id",), 3),
                IndexStats(
                    "customers_region_idx",
                    ("region",),
                    3,
                    ("customer_id",),
                ),
            ),
        ),
        "orders": TableStats(
            rows=5_000_000,
            columns={
                "order_id": ColumnStats(5_000_000, 8),
                "customer_id": ColumnStats(1_000_000, 8),
                "status": ColumnStats(5, 8),
                "total": ColumnStats(500_000, 8),
            },
            indexes=(
                IndexStats("orders_pk", ("order_id",), 3),
                IndexStats(
                    "orders_customer_idx",
                    ("customer_id",),
                    3,
                    ("order_id", "status", "total"),
                ),
            ),
        ),
        "line_items": TableStats(
            rows=20_000_000,
            columns={
                "order_id": ColumnStats(5_000_000, 8),
                "product_id": ColumnStats(100_000, 8),
                "quantity": ColumnStats(20, 4),
            },
            indexes=(
                IndexStats(
                    "line_items_order_idx",
                    ("order_id",),
                    3,
                    ("product_id", "quantity"),
                ),
                IndexStats(
                    "line_items_product_idx",
                    ("product_id",),
                    3,
                    ("order_id", "quantity"),
                ),
            ),
        ),
        "products": TableStats(
            rows=100_000,
            columns={
                "product_id": ColumnStats(100_000, 8),
                "supplier_id": ColumnStats(10_000, 8),
                "category": ColumnStats(100, 16),
                "price": ColumnStats(50_000, 8),
                "name": ColumnStats(95_000, 40),
            },
            indexes=(
                IndexStats("products_pk", ("product_id",), 3),
                IndexStats(
                    "products_category_cover_idx",
                    ("category",),
                    3,
                    ("product_id", "name", "price"),
                ),
                IndexStats(
                    "products_supplier_idx",
                    ("supplier_id",),
                    3,
                    ("product_id",),
                ),
            ),
        ),
        "suppliers": TableStats(
            rows=10_000,
            columns={
                "supplier_id": ColumnStats(10_000, 8),
                "country": ColumnStats(80, 8),
                "name": ColumnStats(9_500, 32),
            },
            indexes=(
                IndexStats("suppliers_pk", ("supplier_id",), 3),
                IndexStats(
                    "suppliers_country_idx",
                    ("country",),
                    3,
                    ("supplier_id", "name"),
                ),
            ),
        ),
    }
)


@dataclass(frozen=True)
class QueryTable:
    """One table used by a query."""

    catalog_name: str
    name: str
    position: int


@dataclass(frozen=True)
class ColumnRef:
    table_name: str
    column_name: str


@dataclass(frozen=True)
class FilterPredicate:
    column: ColumnRef
    operator: str
    value_sql: str
    selectivity: float
    evaluation_cost: int
    sql: str


@dataclass(frozen=True)
class JoinCondition:
    left: ColumnRef
    right: ColumnRef
    operator: str
    sql: str


@dataclass(frozen=True)
class JoinSpec:
    join_type: JoinType
    left_table_names: frozenset[str]
    right_table_name: str
    conditions: tuple[JoinCondition, ...]
    position: int


@dataclass(frozen=True)
class Query:
    """The optimizer input produced from supported SQL."""

    tables: tuple[QueryTable, ...]
    filters: tuple[FilterPredicate, ...]
    joins: tuple[JoinSpec, ...]
    output_columns: tuple[ColumnRef, ...]

    def table(self, name: str) -> QueryTable:
        """Return the query table with this name."""
        for table in self.tables:
            if table.name == name:
                return table
        raise KeyError(name)

    @property
    def table_names(self) -> frozenset[str]:
        return frozenset(table.name for table in self.tables)

    @property
    def nullable_table_names(self) -> frozenset[str]:
        """Return tables that may receive NULL rows from an outer join."""
        nullable: set[str] = set()
        for join in self.joins:
            if join.join_type in {JoinType.LEFT, JoinType.FULL}:
                nullable.add(join.right_table_name)
            if join.join_type in {JoinType.RIGHT, JoinType.FULL}:
                nullable.update(join.left_table_names)
        return frozenset(nullable)

    @property
    def pushable_filters(self) -> tuple[FilterPredicate, ...]:
        """Return filters that may safely run before all joins."""
        nullable = self.nullable_table_names
        return tuple(
            predicate
            for predicate in self.filters
            if predicate.column.table_name not in nullable
        )

    @property
    def residual_filters(self) -> tuple[FilterPredicate, ...]:
        """Return filters that must remain above an outer join."""
        pushable = set(self.pushable_filters)
        return tuple(
            predicate for predicate in self.filters if predicate not in pushable
        )

    def required_columns(self, table_name: str) -> tuple[str, ...]:
        """Return columns that a table scan must provide.

        Output, filter, and join columns are required. Keeping only these
        columns models projection pushdown without adding a separate operator.
        """
        columns = {
            column.column_name
            for column in self.output_columns
            if column.table_name == table_name
        }
        for predicate in self.filters:
            if predicate.column.table_name == table_name:
                columns.add(predicate.column.column_name)
        for join in self.joins:
            for condition in join.conditions:
                if condition.left.table_name == table_name:
                    columns.add(condition.left.column_name)
                if condition.right.table_name == table_name:
                    columns.add(condition.right.column_name)
        return tuple(sorted(columns))


@dataclass(frozen=True)
class ScanPlan:
    table: QueryTable
    method: ScanMethod
    required_columns: tuple[str, ...]
    index_name: str | None = None
    filter_applied_by_scan_index: FilterPredicate | None = None
    lookup_predicates: tuple[FilterPredicate, ...] = ()


@dataclass(frozen=True)
class FilterPlan:
    child: Plan
    predicate: FilterPredicate


@dataclass(frozen=True)
class JoinPlan:
    left: Plan
    right: Plan
    join_type: JoinType
    method: JoinMethod
    conditions: tuple[JoinCondition, ...]
    index_name: str | None = None


Plan = ScanPlan | FilterPlan | JoinPlan


@dataclass(frozen=True)
class Estimate:
    rows: int
    cost: float


@dataclass(frozen=True)
class JoinChoice:
    join_type: JoinType
    conditions: tuple[JoinCondition, ...]


def _split_and(expression: exp.Expression) -> list[exp.Expression]:
    if isinstance(expression, exp.And):
        return _split_and(expression.this) + _split_and(expression.expression)
    return [expression]


def _table_expression(node: exp.Expression) -> exp.Table:
    if not isinstance(node, exp.Table):
        raise UnsupportedQuery("Subqueries and table functions are not supported")
    return node


def _query_table(sql_table: exp.Table, position: int, catalog: Catalog) -> QueryTable:
    """Convert a SQLGlot table and verify that it exists in the catalog."""
    catalog_name = sql_table.name.lower()
    catalog.table(catalog_name)
    return QueryTable(catalog_name, sql_table.alias_or_name.lower(), position)


def _resolve_column(
    column: exp.Column,
    tables_by_name: dict[str, QueryTable],
    catalog: Catalog,
) -> ColumnRef:
    column_name = column.name.lower()
    if column.table:
        table_name = column.table.lower()
        if table_name not in tables_by_name:
            raise UnsupportedQuery(f"Unknown table name: {table_name}")
        table = tables_by_name[table_name]
        if column_name not in catalog.table(table.catalog_name).columns:
            raise UnsupportedQuery(f"Unknown column: {table_name}.{column_name}")
        return ColumnRef(table_name, column_name)

    matching = [
        table.name
        for table in tables_by_name.values()
        if column_name in catalog.table(table.catalog_name).columns
    ]
    if len(matching) != 1:
        raise UnsupportedQuery(
            f"Column must be qualified or unambiguous: {column_name}"
        )
    return ColumnRef(matching[0], column_name)


def _literal_sql(expression: exp.Expression) -> str:
    """Return supported literal SQL used by a filter."""
    if not isinstance(expression, (exp.Literal, exp.Boolean)):
        raise UnsupportedQuery("Filters must compare a column with a literal")
    return expression.sql(dialect="duckdb")


def _column_selectivity(
    column: ColumnRef,
    operator: str,
    tables_by_name: dict[str, QueryTable],
    catalog: Catalog,
) -> float:
    """Attach a provided approximation to a parsed filter.

    Equality uses catalog distinct-value statistics. Range and LIKE estimates
    are fixed approximations. Students receive the result in FilterPredicate.
    """
    table = tables_by_name[column.table_name]
    stats = catalog.table(table.catalog_name).columns[column.column_name]
    distinct_values = max(stats.distinct_values, 1)
    if operator == "=":
        return 1.0 / distinct_values
    if operator in {"!=", "<>"}:
        return 1.0 - 1.0 / distinct_values
    if operator == "LIKE":
        return 0.10
    return 1.0 / 3.0


def _filter_operator(expression: exp.Expression) -> str:
    """Convert a supported SQLGlot comparison into its SQL operator."""
    operator_types: tuple[tuple[type[exp.Expression], str], ...] = (
        (exp.EQ, "="),
        (exp.NEQ, "!="),
        (exp.LTE, "<="),
        (exp.LT, "<"),
        (exp.GTE, ">="),
        (exp.GT, ">"),
        (exp.Like, "LIKE"),
    )
    for expression_type, symbol in operator_types:
        if isinstance(expression, expression_type):
            return symbol
    raise UnsupportedQuery(f"Unsupported filter: {expression.sql(dialect='duckdb')}")


def _parse_filter(
    expression: exp.Expression,
    tables_by_name: dict[str, QueryTable],
    catalog: Catalog,
) -> FilterPredicate:
    """Convert one WHERE condition and attach its provided estimates."""
    operator = _filter_operator(expression)
    left = expression.this
    right = expression.expression
    if isinstance(left, exp.Column):
        column_expression = left
        literal_expression = right
    elif isinstance(right, exp.Column) and operator != "LIKE":
        column_expression = right
        literal_expression = left
        operator = {
            "<": ">",
            "<=": ">=",
            ">": "<",
            ">=": "<=",
            "=": "=",
            "!=": "!=",
        }[operator]
    else:
        raise UnsupportedQuery(
            "Filters must compare exactly one column with one literal"
        )

    column = _resolve_column(column_expression, tables_by_name, catalog)
    return FilterPredicate(
        column=column,
        operator=operator,
        value_sql=_literal_sql(literal_expression),
        selectivity=_column_selectivity(column, operator, tables_by_name, catalog),
        evaluation_cost=200 if operator == "LIKE" else 5,
        sql=expression.sql(dialect="duckdb"),
    )


def _parse_join_condition(
    expression: exp.Expression,
    tables_by_name: dict[str, QueryTable],
    left_table_names: frozenset[str],
    right_table_name: str,
    catalog: Catalog,
) -> JoinCondition:
    """Convert one equality that connects a new table to previous tables."""
    if not (
        isinstance(expression, exp.EQ)
        and isinstance(expression.this, exp.Column)
        and isinstance(expression.expression, exp.Column)
    ):
        raise UnsupportedQuery("Join conditions must be equalities between columns")
    left = _resolve_column(expression.this, tables_by_name, catalog)
    right = _resolve_column(expression.expression, tables_by_name, catalog)
    referenced = {left.table_name, right.table_name}
    if not (
        right_table_name in referenced
        and referenced.intersection(left_table_names)
        and len(referenced) == 2
    ):
        raise UnsupportedQuery(
            "Each join condition must connect the new table to a previous table"
        )
    return JoinCondition(left, right, "=", expression.sql(dialect="duckdb"))


def _join_type(join: exp.Join) -> JoinType:
    """Return the join type represented by SQLGlot."""
    side = str(join.args.get("side") or "").upper()
    kind = str(join.args.get("kind") or "").upper()
    if kind == "CROSS":
        return JoinType.CROSS
    if side == "LEFT":
        return JoinType.LEFT
    if side == "RIGHT":
        return JoinType.RIGHT
    if side == "FULL":
        return JoinType.FULL
    if side not in {"", "INNER"} or kind not in {"", "INNER"}:
        raise UnsupportedQuery(f"Unsupported join type: {side or kind}")
    return JoinType.INNER


def _parse_output_columns(
    expressions: list[exp.Expression],
    tables_by_name: dict[str, QueryTable],
    catalog: Catalog,
) -> tuple[ColumnRef, ...]:
    """Expand SELECT columns and stars into concrete output columns."""
    result: list[ColumnRef] = []
    for expression in expressions:
        if isinstance(expression, exp.Star):
            for table in tables_by_name.values():
                for column_name in catalog.table(table.catalog_name).columns:
                    result.append(ColumnRef(table.name, column_name))
            continue
        if isinstance(expression, exp.Column) and isinstance(expression.this, exp.Star):
            table_name = expression.table.lower()
            if table_name not in tables_by_name:
                raise UnsupportedQuery(f"Unknown table name: {table_name}")
            table = tables_by_name[table_name]
            for column_name in catalog.table(table.catalog_name).columns:
                result.append(ColumnRef(table_name, column_name))
            continue
        if isinstance(expression, exp.Column):
            result.append(_resolve_column(expression, tables_by_name, catalog))
            continue
        raise UnsupportedQuery("SELECT supports only columns and *")
    return tuple(result)


def parse_sql(sql: str, catalog: Catalog = CATALOG) -> Query:
    """Parse supported SQL into the small model used by the optimizer."""
    try:
        tree = parse_one(sql, read="duckdb")
    except ParseError as error:
        raise UnsupportedQuery(str(error)) from error
    if (
        not isinstance(tree, exp.Select)
        or sum(1 for _ in tree.find_all(exp.Select)) != 1
    ):
        raise UnsupportedQuery("Exactly one SELECT without subqueries is required")

    for clause in ("with_", "group", "having", "order", "limit", "qualify", "distinct"):
        if tree.args.get(clause) is not None:
            raise UnsupportedQuery("Only SELECT, FROM, JOIN, and WHERE are supported")
    if tree.find(exp.AggFunc) or tree.find(exp.Window):
        raise UnsupportedQuery("Aggregation and window functions are not supported")

    from_expression = tree.args.get("from_")
    if from_expression is None or from_expression.this is None:
        raise UnsupportedQuery("FROM is required")

    first_table = _query_table(_table_expression(from_expression.this), 0, catalog)
    tables = [first_table]
    tables_by_name = {first_table.name: first_table}
    joins: list[JoinSpec] = []

    for position, sql_join in enumerate(tree.args.get("joins") or [], start=1):
        table = _query_table(_table_expression(sql_join.this), position, catalog)
        if table.name in tables_by_name:
            raise UnsupportedQuery(f"Duplicate table name: {table.name}")
        tables_by_name[table.name] = table
        tables.append(table)
        join_type = _join_type(sql_join)
        left_table_names = frozenset(item.name for item in tables[:-1])
        on_expression = sql_join.args.get("on")
        if join_type == JoinType.CROSS:
            if on_expression is not None:
                raise UnsupportedQuery("CROSS JOIN cannot have an ON condition")
            conditions: tuple[JoinCondition, ...] = ()
        else:
            if on_expression is None:
                raise UnsupportedQuery("JOIN requires an ON condition")
            conditions = tuple(
                _parse_join_condition(
                    condition,
                    tables_by_name,
                    left_table_names,
                    table.name,
                    catalog,
                )
                for condition in _split_and(on_expression)
            )
        joins.append(
            JoinSpec(
                join_type,
                left_table_names,
                table.name,
                conditions,
                position,
            )
        )

    if len(tables) > 6:
        raise UnsupportedQuery("At most six tables are supported")

    filters: tuple[FilterPredicate, ...] = ()
    where = tree.args.get("where")
    if where is not None:
        filters = tuple(
            _parse_filter(item, tables_by_name, catalog)
            for item in _split_and(where.this)
        )

    output_columns = _parse_output_columns(tree.expressions, tables_by_name, catalog)
    return Query(tuple(tables), filters, tuple(joins), output_columns)


def plan_table_names(plan: Plan) -> frozenset[str]:
    """Return every table name contained in a plan tree."""
    if isinstance(plan, ScanPlan):
        return frozenset((plan.table.name,))
    if isinstance(plan, FilterPlan):
        return plan_table_names(plan.child)
    return plan_table_names(plan.left) | plan_table_names(plan.right)


def legal_join_choice(
    query: Query,
    left_table_names: frozenset[str],
    right_table_names: frozenset[str],
) -> JoinChoice | None:
    """Check whether the left and right table groups can be joined now.

    Example: for `A JOIN B ON A.id = B.a_id`, passing `{"A"}` and
    `{"B"}` returns the INNER join and its `A.id = B.a_id` condition.
    Passing two groups with no join condition between them returns `None`.

    We need this check to avoid joining disconnected tables and to preserve the
    required order of LEFT, RIGHT, FULL, and CROSS joins. This function chooses
    the SQL join and conditions, not the physical hash or nested-loop method.
    """
    if not left_table_names or not right_table_names:
        return None
    if left_table_names & right_table_names:
        return None

    first_fixed_position: int | None = None
    for join in query.joins:
        if join.join_type != JoinType.INNER:
            first_fixed_position = join.position
            break

    if first_fixed_position is not None:
        for join in query.joins:
            if join.position < first_fixed_position:
                continue
            if (
                left_table_names == join.left_table_names
                and right_table_names == frozenset((join.right_table_name,))
            ):
                return JoinChoice(join.join_type, join.conditions)

        fixed_region_names = {
            table.name
            for table in query.tables
            if table.position >= first_fixed_position
        }
        if (left_table_names | right_table_names) & fixed_region_names:
            return None

    conditions: list[JoinCondition] = []
    for join in query.joins:
        if join.join_type != JoinType.INNER:
            continue
        if first_fixed_position is not None and join.position >= first_fixed_position:
            continue
        for condition in join.conditions:
            condition_names = {
                condition.left.table_name,
                condition.right.table_name,
            }
            crosses = bool(condition_names & left_table_names) and bool(
                condition_names & right_table_names
            )
            if crosses:
                conditions.append(condition)
    if not conditions:
        return None
    return JoinChoice(JoinType.INNER, tuple(conditions))


def get_possible_scan_plans(
    table: QueryTable,
    predicates: tuple[FilterPredicate, ...],
    required_columns: tuple[str, ...],
    catalog: Catalog = CATALOG,
) -> tuple[ScanPlan, ...]:
    """Return sequential, usable index, and covering-index scans."""
    plans: list[ScanPlan] = [ScanPlan(table, ScanMethod.SEQUENTIAL, required_columns)]
    stats = catalog.table(table.catalog_name)
    indexable_operators = {"=", "<", "<=", ">", ">="}

    for index in stats.indexes:
        if index.covers(required_columns):
            plans.append(
                ScanPlan(
                    table,
                    ScanMethod.INDEX_ONLY,
                    required_columns,
                    index.name,
                )
            )
        for predicate in predicates:
            if (
                predicate.operator not in indexable_operators
                or not index.key_columns
                or predicate.column.column_name != index.key_columns[0]
            ):
                continue
            method = (
                ScanMethod.INDEX_ONLY
                if index.covers(required_columns)
                else ScanMethod.INDEX
            )
            plans.append(
                ScanPlan(
                    table,
                    method,
                    required_columns,
                    index.name,
                    predicate,
                )
            )
    return tuple(plans)


def _find_scan(plan: Plan) -> ScanPlan:
    """Return the scan under a one-table access plan."""
    if isinstance(plan, ScanPlan):
        return plan
    if isinstance(plan, FilterPlan):
        return _find_scan(plan.child)
    raise ValueError("Expected a plan for one table")


def _filters_in_access_plan(plan: Plan) -> tuple[FilterPredicate, ...]:
    """Return every filter already present in a one-table access plan."""
    if isinstance(plan, ScanPlan):
        filters: list[FilterPredicate] = []
        if plan.filter_applied_by_scan_index is not None:
            filters.append(plan.filter_applied_by_scan_index)
        filters.extend(plan.lookup_predicates)
        return tuple(filters)
    if isinstance(plan, FilterPlan):
        return _filters_in_access_plan(plan.child) + (plan.predicate,)
    raise ValueError("Expected a plan for one table")


def _join_index(
    plan: Plan,
    conditions: tuple[JoinCondition, ...],
    catalog: Catalog,
) -> IndexStats | None:
    """Return an index usable when this one-table plan is a join inner input."""
    names = plan_table_names(plan)
    if len(names) != 1:
        return None
    table_name = next(iter(names))
    scan = _find_scan(plan)
    for condition in conditions:
        if condition.left.table_name == table_name:
            column_name = condition.left.column_name
        elif condition.right.table_name == table_name:
            column_name = condition.right.column_name
        else:
            continue
        index = catalog.index_on(scan.table.catalog_name, column_name)
        if index is not None:
            return index
    return None


def _as_index_lookup(plan: Plan, index: IndexStats) -> ScanPlan:
    """Convert one access plan into an indexed join lookup."""
    scan = _find_scan(plan)
    return ScanPlan(
        table=scan.table,
        method=ScanMethod.INDEX_LOOKUP,
        required_columns=scan.required_columns,
        index_name=index.name,
        lookup_predicates=_filters_in_access_plan(plan),
    )


def join_candidates(
    left: Plan,
    right: Plan,
    choice: JoinChoice,
    catalog: Catalog = CATALOG,
) -> tuple[JoinPlan, ...]:
    """Return every allowed physical join plan for two subset plans."""
    if choice.join_type == JoinType.CROSS:
        return (
            JoinPlan(
                left,
                right,
                choice.join_type,
                JoinMethod.NESTED_LOOP,
                (),
            ),
        )

    candidates = [
        JoinPlan(left, right, choice.join_type, JoinMethod.HASH, choice.conditions),
        JoinPlan(
            left,
            right,
            choice.join_type,
            JoinMethod.NESTED_LOOP,
            choice.conditions,
        ),
    ]
    if choice.join_type != JoinType.INNER:
        return tuple(candidates)

    right_index = _join_index(right, choice.conditions, catalog)
    if right_index is not None:
        candidates.append(
            JoinPlan(
                left,
                _as_index_lookup(right, right_index),
                choice.join_type,
                JoinMethod.INDEX_NESTED_LOOP,
                choice.conditions,
                right_index.name,
            )
        )
    return tuple(candidates)


class CostModel:
    """Estimate physical-plan cost and cardinality without executing SQL.

    `random_page_cost` is the relative cost of fetching a non-sequential page.
    Its default of 4.0 is a teaching assumption based on PostgreSQL's default,
    It is cost configuration rather than catalog metadata because it describes the execution environment, not one table.
    """

    def __init__(
        self,
        query: Query,
        catalog: Catalog = CATALOG,
        random_page_cost: float = 4.0,
    ):
        self.query = query
        self.catalog = catalog
        self.random_page_cost = random_page_cost
        self._cache: dict[Plan, Estimate] = {}

    def estimate(self, plan: Plan) -> Estimate:
        """Return a cached estimate for a plan."""
        if plan not in self._cache:
            self._cache[plan] = self._estimate(plan)
        return self._cache[plan]

    def _column_width(self, table: QueryTable, columns: tuple[str, ...]) -> int:
        stats = self.catalog.table(table.catalog_name)
        return max(1, sum(stats.columns[name].average_size for name in columns))

    def _full_width(self, table: QueryTable) -> int:
        stats = self.catalog.table(table.catalog_name)
        return max(1, sum(column.average_size for column in stats.columns.values()))

    def _estimate(self, plan: Plan) -> Estimate:
        if isinstance(plan, ScanPlan):
            stats = self.catalog.table(plan.table.catalog_name)
            rows = stats.rows
            width_ratio = self._column_width(
                plan.table, plan.required_columns
            ) / self._full_width(plan.table)

            if plan.method == ScanMethod.SEQUENTIAL:
                return Estimate(rows, max(1.0, rows * width_ratio))
            if plan.method == ScanMethod.INDEX_LOOKUP:
                for predicate in plan.lookup_predicates:
                    rows = max(1, ceil(rows * predicate.selectivity))
                return Estimate(rows, 0.0)

            if plan.index_name is None:
                raise InvalidPlan("Index scan requires an index")
            index_stats = self.catalog.index_named(
                plan.table.catalog_name,
                plan.index_name,
            )
            if index_stats is None:
                raise InvalidPlan("Unknown scan index")

            predicate = plan.filter_applied_by_scan_index
            matched_rows = rows
            if predicate is not None:
                matched_rows = max(1, ceil(rows * predicate.selectivity))

            if plan.method == ScanMethod.INDEX_ONLY:
                startup = index_stats.height if predicate is not None else 0
                return Estimate(
                    matched_rows,
                    float(startup + max(1.0, matched_rows * width_ratio * 0.5)),
                )
            if predicate is None:
                raise InvalidPlan("Index scan must apply a filter")
            cost = (
                index_stats.height
                + self.random_page_cost * matched_rows
                + matched_rows * width_ratio
            )
            return Estimate(matched_rows, float(cost))

        if isinstance(plan, FilterPlan):
            child = self.estimate(plan.child)
            output_rows = max(1, ceil(child.rows * plan.predicate.selectivity))
            filter_cost = child.rows * plan.predicate.evaluation_cost
            return Estimate(output_rows, child.cost + filter_cost)

        left = self.estimate(plan.left)
        right = self.estimate(plan.right)
        output_rows = self._join_rows(plan, left.rows, right.rows)
        if plan.method == JoinMethod.HASH:
            cost = left.cost + right.cost + 2 * left.rows + right.rows + output_rows
        elif plan.method == JoinMethod.NESTED_LOOP:
            cost = left.cost + right.cost + left.rows * right.rows + output_rows
        else:
            inner_scan = _find_scan(plan.right)
            if inner_scan.index_name is None:
                raise InvalidPlan("Index lookup requires an index")
            inner_index = self.catalog.index_named(
                inner_scan.table.catalog_name,
                inner_scan.index_name,
            )
            if inner_index is None:
                raise InvalidPlan("Unknown lookup index")
            inner_rows = self.catalog.table(inner_scan.table.catalog_name).rows
            rows_per_lookup, filter_cost = self._index_lookup_work(
                plan, inner_scan, inner_rows
            )
            lookup_cost = (
                inner_index.height
                + self.random_page_cost * rows_per_lookup
                + filter_cost
            )
            cost = left.cost + left.rows * lookup_cost + output_rows
        return Estimate(output_rows, float(cost))

    def _index_lookup_work(
        self,
        plan: JoinPlan,
        inner_scan: ScanPlan,
        inner_table_rows: int,
    ) -> tuple[int, float]:
        inner_name = inner_scan.table.name
        for condition in plan.conditions:
            if condition.left.table_name == inner_name:
                column = condition.left
            elif condition.right.table_name == inner_name:
                column = condition.right
            else:
                continue
            table = self.query.table(inner_name)
            distinct = (
                self.catalog.table(table.catalog_name)
                .columns[column.column_name]
                .distinct_values
            )
            rows = max(1, ceil(inner_table_rows / max(distinct, 1)))
            filter_cost = 0.0
            for predicate in inner_scan.lookup_predicates:
                filter_cost += rows * predicate.evaluation_cost
                rows = max(1, ceil(rows * predicate.selectivity))
            return rows, filter_cost
        return inner_table_rows, 0.0

    def _join_rows(self, plan: JoinPlan, left_rows: int, right_rows: int) -> int:
        rows = left_rows * right_rows
        if plan.join_type != JoinType.CROSS and plan.conditions:
            left_names = plan_table_names(plan.left)
            for condition in plan.conditions:
                if condition.left.table_name in left_names:
                    left_column, right_column = condition.left, condition.right
                else:
                    left_column, right_column = condition.right, condition.left
                left_distinct = min(self._distinct_values(left_column), left_rows)
                right_distinct = min(self._distinct_values(right_column), right_rows)
                rows = max(1, ceil(rows / max(left_distinct, right_distinct, 1)))
        if plan.join_type == JoinType.LEFT:
            return max(left_rows, rows)
        if plan.join_type == JoinType.RIGHT:
            return max(right_rows, rows)
        if plan.join_type == JoinType.FULL:
            return max(left_rows, right_rows, rows)
        return max(1, rows)

    def _distinct_values(self, column: ColumnRef) -> int:
        table = self.query.table(column.table_name)
        return (
            self.catalog.table(table.catalog_name)
            .columns[column.column_name]
            .distinct_values
        )


def _walk(plan: Plan):
    """Yield all nodes in a plan tree."""
    yield plan
    if isinstance(plan, FilterPlan):
        yield from _walk(plan.child)
    elif isinstance(plan, JoinPlan):
        yield from _walk(plan.left)
        yield from _walk(plan.right)


def validate_plan(plan: Plan, query: Query, catalog: Catalog = CATALOG) -> None:
    """Raise `InvalidPlan` if a plan does not correctly implement its query."""
    scans = [node for node in _walk(plan) if isinstance(node, ScanPlan)]
    if Counter(scan.table.name for scan in scans) != Counter(
        table.name for table in query.tables
    ):
        raise InvalidPlan("Every table must appear exactly once")

    seen_filters: list[FilterPredicate] = []
    seen_conditions: list[JoinCondition] = []
    joins: list[JoinPlan] = []

    for node in _walk(plan):
        if isinstance(node, ScanPlan):
            if node.required_columns != query.required_columns(node.table.name):
                raise InvalidPlan("Scan does not provide the required columns")
            predicate = node.filter_applied_by_scan_index
            if predicate is not None:
                seen_filters.append(predicate)
            seen_filters.extend(node.lookup_predicates)

            if node.method in {ScanMethod.INDEX, ScanMethod.INDEX_ONLY}:
                if node.index_name is None:
                    raise InvalidPlan("Index scan requires an index")
                index = catalog.index_named(node.table.catalog_name, node.index_name)
                if index is None:
                    raise InvalidPlan("Unknown scan index")
                if predicate is not None and (
                    not index.key_columns
                    or index.key_columns[0] != predicate.column.column_name
                ):
                    raise InvalidPlan("Index cannot apply this filter")
                if node.method == ScanMethod.INDEX and predicate is None:
                    raise InvalidPlan("Index scan must apply a filter")
                if node.method == ScanMethod.INDEX_ONLY and not index.covers(
                    node.required_columns
                ):
                    raise InvalidPlan("Index-only scan does not cover required columns")
            continue

        if isinstance(node, FilterPlan):
            seen_filters.append(node.predicate)
            expected_names = (
                query.table_names
                if node.predicate in query.residual_filters
                else frozenset((node.predicate.column.table_name,))
            )
            if plan_table_names(node.child) != expected_names:
                raise InvalidPlan("Filter is not in the correct place")
            continue

        if plan_table_names(node.left) & plan_table_names(node.right):
            raise InvalidPlan("Join inputs contain the same table")
        seen_conditions.extend(node.conditions)
        joins.append(node)
        if node.method == JoinMethod.HASH and not node.conditions:
            raise InvalidPlan("Hash join requires an equality condition")
        if node.join_type == JoinType.CROSS and node.method != JoinMethod.NESTED_LOOP:
            raise InvalidPlan("Cross joins use nested-loop join")
        if node.method == JoinMethod.INDEX_NESTED_LOOP:
            valid = (
                node.index_name is not None
                and isinstance(node.right, ScanPlan)
                and node.right.method == ScanMethod.INDEX_LOOKUP
                and node.right.index_name == node.index_name
                and _join_index(node.right, node.conditions, catalog) is not None
            )
            if not valid:
                raise InvalidPlan("Invalid indexed nested-loop join")

    if Counter(seen_filters) != Counter(query.filters):
        raise InvalidPlan("Every filter must appear exactly once")
    expected_conditions = [
        condition for join in query.joins for condition in join.conditions
    ]
    if Counter(seen_conditions) != Counter(expected_conditions):
        raise InvalidPlan("Every join condition must appear exactly once")

    first_fixed_position = next(
        (join.position for join in query.joins if join.join_type != JoinType.INNER),
        None,
    )
    if first_fixed_position is not None:
        ordered_specs = [
            join for join in query.joins if join.position >= first_fixed_position
        ]
        for expected in ordered_specs:
            if not any(
                returned.join_type == expected.join_type
                and plan_table_names(returned.left) == expected.left_table_names
                and plan_table_names(returned.right)
                == frozenset((expected.right_table_name,))
                and Counter(returned.conditions) == Counter(expected.conditions)
                for returned in joins
            ):
                raise InvalidPlan(
                    "Plan changes the required join order after an outer or cross join"
                )

    if plan_table_names(plan) != query.table_names:
        raise InvalidPlan("Plan does not cover the complete query")


def format_plan(plan: Plan, cost_model: CostModel) -> str:
    """Return a readable plan tree with row and cost estimates."""
    lines: list[str] = []

    def visit(node: Plan, prefix: str, label: str) -> None:
        estimate = cost_model.estimate(node)
        if isinstance(node, ScanPlan):
            columns = ", ".join(node.required_columns)
            detail = f"{node.method.value} {node.table.catalog_name} AS {node.table.name} <{columns}>"
            if node.index_name:
                detail += f" USING {node.index_name}"
            if node.lookup_predicates:
                detail += (
                    " ["
                    + " AND ".join(
                        predicate.sql for predicate in node.lookup_predicates
                    )
                    + "]"
                )
        elif isinstance(node, FilterPlan):
            detail = f"FILTER [{node.predicate.sql}]"
        else:
            conditions = (
                " AND ".join(condition.sql for condition in node.conditions) or "TRUE"
            )
            detail = f"{node.method.value} {node.join_type.value} [{conditions}]"
            if node.index_name:
                detail += f" USING {node.index_name}"
        lines.append(
            f"{prefix}{label}{detail}  rows={estimate.rows} cost={estimate.cost:.0f}"
        )
        child_prefix = prefix + ("   " if label else "")
        if isinstance(node, FilterPlan):
            visit(node.child, child_prefix, "`- ")
        elif isinstance(node, JoinPlan):
            visit(node.left, child_prefix, "+- ")
            visit(node.right, child_prefix, "`- ")

    visit(plan, "", "")
    return "\n".join(lines)
