# Architecture

## Project structure

- src/
  - core/        → business logic (date, filtering, export)
  - adapters/    → DOM / XHR extraction
  - dashboard/   → UI (HTML, CSS, JS)
  - runners/     → orchestration logic

## Data flow

1. User clicks "Start"
2. Initial DOM extraction runs
3. XHR interception captures additional orders
4. Orders are filtered by date range
5. Orders are stored in memory
6. User exports data (JSON / CSV)

## Design principles

- Separation of concerns
- Minimal dependencies
- Modular and replaceable components

## Future evolution

- API-only scraping mode (experimental)
- Browser extension packaging
- Advanced analytics module