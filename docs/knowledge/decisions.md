# Technical & Product Decisions

## Product scope

- Focus only on Deliveroo customer website
- No support for restaurant or rider interfaces
- Keep the product atomic and focused

## Userscript first approach

- Faster iteration
- No browser store validation
- Easier distribution and testing

## Installation strategy

The project should support two installation paths over time:

1. Userscript (primary for early versions)
2. Browser extension (future distribution path)

Userscript remains the fastest way to iterate and test the product.

The browser extension should be planned as a future packaging target, not as a separate product.  
The core logic must stay shared between both installation methods.

Guidelines:
- Do not couple core logic to Tampermonkey APIs
- Keep runners/adapters isolated
- Keep dashboard reusable
- Prefer browser-native APIs only in dedicated adapters
- Avoid extension-specific decisions before the userscript is stable

## Code paradigms

- SOLID
- KISS
- YAGNI
- DRY

## Scraping strategy

- Hybrid approach:
  - Initial DOM extraction (first visible orders)
  - XHR/fetch interception for dynamic loading

Reason:
- DOM-only is fragile
- API-only requires reverse engineering and may break

## Date handling

- Inclusive full-day range:
  - Start: 00:00:00.000
  - End: 23:59:59.999

## Export strategy

- JSON first (flexible, structured)
- CSV second (user-friendly, Excel compatible)

## Dashboard philosophy

- Keep it simple
- No configuration in early versions
- Focus on usability over power

## Logs

- Visible but not intrusive
- Collapsible for non-technical users