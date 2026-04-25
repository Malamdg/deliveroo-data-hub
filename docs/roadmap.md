# Roadmap

## v0.1 - Userscript MVP

- [x] Project structure
- [x] Userscript build pipeline
- [x] Dashboard overlay
- [x] External dashboard HTML and CSS
- [x] Network interception
- [x] Orders extraction from network responses
- [x] Order store and deduplication
- [x] Inclusive date range filtering
- [x] Initial DOM extraction fallback
- [x] Automated "view more" collection
- [x] JSON export
- [x] Basic dashboard stats
- [x] UI logs
- [x] Error feedback
- [x] Manual test on Deliveroo customer orders page
- [x] Release notes for v0.1

## v0.2.0 - Export & Reliability

### Goal

Improve data export usability and make the scraping flow more reliable before adding advanced insights.

### Scope

- [ ] Add CSV export
- [ ] Add export format selector (JSON / CSV)
- [ ] Improve initial DOM extraction reliability
- [ ] Improve "view more" button detection
- [ ] Add empty-state handling when no orders are found
- [ ] Improve dashboard UX (collapsible logs + clearer status)
- [ ] Add safer export error handling
- [ ] Add installation guide for Tampermonkey
- [ ] Add basic usage guide
- [ ] Add manual smoke-test checklist before release

### Out of scope

- API direct mode
- Advanced analytics
- Charts
- Configurable dashboard widgets
- Browser extension packaging

## v0.3 - Data insights

- [ ] Total spent by period
- [ ] Orders per month
- [ ] Top restaurants
- [ ] Average basket

## v0.4 - Enhanced overlay

- [ ] In-page stats overlay
- [ ] Better UX states
- [ ] Collapsible sections

## v1.0 - Stable release

- [ ] Stable userscript distribution
- [ ] Documentation
- [ ] Known limitations