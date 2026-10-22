"""Write the web demo fixtures: python -m scripts.export_fixtures (run from apps/agents)."""

import asyncio
import json
from pathlib import Path

from src.fixtures import build_fixtures

TARGET = Path(__file__).resolve().parents[3] / "libs" / "mock-data" / "src" / "brand-os.json"


def main() -> None:
    data = asyncio.run(build_fixtures())
    TARGET.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {TARGET}")


if __name__ == "__main__":
    main()
