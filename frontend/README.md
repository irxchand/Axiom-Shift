# Frontend

**Owner**: Person 3 (Frontend)

## Boundaries
- Responsible for the Command Center UI, Timetable UI, Chat UI, and Evaluation Views.
- The UI is exclusively driven by the state provided by the Backend API.
- **DO NOT** implement complex domain logic (like evaluation formulas or current/next class calculations) in the frontend. It should only display backend-computed state.
- **DO NOT** make direct calls to the Browser Automation Framework. All operations must route through the Backend.
