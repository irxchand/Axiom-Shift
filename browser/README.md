# Browser Automation Framework

**Owner**: Person 1 (Chief Architect)

## Boundaries
- This module wraps the local Playwright functionality (`BrowserFrameworkAdapter`).
- **DO NOT** expose Playwright objects, selectors, profile paths, or cookies outside of this boundary.
- The `BrowserFrameworkAdapter` exposes a strictly controlled JSON-in/JSON-out CLI interface for backend workers to consume.

## Sub-modules
- `framework/`: The core adapter logic, browser sessions, chat runtime, and source workspace upload flow.
- `runner/`: The CLI entry point.
- `adapters/`: Provider-specific adapter configuration JSONs.
