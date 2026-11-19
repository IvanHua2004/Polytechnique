"""Run the student optimizer on one SQL query."""

from __future__ import annotations

import sys
from pathlib import Path

from optimizer import optimize
from utils import CATALOG, CostModel, UnsupportedQuery, format_plan, parse_sql, validate_plan


def read_sql() -> str:
    """Read SQL from the file given on the command line."""
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python main.py query.sql")
    return Path(sys.argv[1]).read_text(encoding="utf-8")


def main() -> None:
    try:
        query = parse_sql(read_sql(), CATALOG)
        plan = optimize(query, CATALOG)
        validate_plan(plan, query, CATALOG)
    except (UnsupportedQuery, ValueError) as error:
        raise SystemExit(f"Error: {error}") from error

    cost_model = CostModel(query, CATALOG)
    print(format_plan(plan, cost_model))
    print(f"\nTOTAL COST: {cost_model.estimate(plan).cost:.0f}")


if __name__ == "__main__":
    main()
