# Chat Notes

## v0.1.0 decisions

- Dashboard overlay implemented
- Start / Pause / Stop / Export controls
- JSON export implemented
- XHR interception working
- Initial DOM extraction required (first 25 orders)
- Date range filtering implemented

## v0.1.0 learnings

- Start button bug due to initialization timing
- DOM extraction must run immediately
- Userscript header must support all Deliveroo domains

## v0.2.0 direction

- Focus on reliability and usability
- Add CSV export
- Improve scraping robustness
- Improve dashboard UX

## UX improvements

- Collapsible logs to reduce noise
- Clearer status messages
- Keep UI minimal and accessible

## Product philosophy

- Avoid overengineering
- Deliver small, working iterations
- Keep the project enjoyable (not like work)

## Important constraints

- No dependency on Deliveroo internal APIs only
- Must work as long as user is logged in
- Must remain lightweight