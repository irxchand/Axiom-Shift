# Backend

**Owner**: Person 4 (Infrastructure/Backend)

## Boundaries
- Serves the frontend via strict APIs.
- Responsible for database interactions, compiling the `SemesterOperationsState`, and executing evaluation/risk heuristics defined by Person 2.
- Handles document upload staging and triggers cleanup workers.
- **DO NOT** import Playwright or Browser Framework internals directly. Interact with the browser framework strictly via the `BrowserFrameworkAdapter` CLI integration.
