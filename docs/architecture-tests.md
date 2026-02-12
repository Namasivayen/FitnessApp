# Architecture & Test Coverage

## Immutability & Boundaries

- **Roadmap Layer**: Roadmap data is strictly immutable for users and AI. Only admin endpoints can create/version/activate roadmaps. Tests ensure users/AI cannot mutate roadmap data.
- **AI Layer**: AI responses are advisory-only and never write to roadmap collections. Tests verify no roadmap writes occur from AI.
- **User Execution Layer**: Only one active roadmap per user is enforced. Tests ensure duplicate active assignments are rejected.
- **Readiness Layer**: Readiness score calculations do not alter roadmap plans. Tests confirm no roadmap updates are triggered by readiness logic.

## Test Summary

- `roadmap.immutability.test.ts`: Users/AI cannot mutate roadmap data.
- `ai.boundary.test.ts`: AI cannot write to roadmap collections.
- `user.roadmap.test.ts`: Only one active roadmap per user.
- `readiness.boundary.test.ts`: Readiness score does not alter plans.

## Layered Architecture

- **Roadmap Layer (immutable)**: Predefined, static, versioned fitness roadmaps. No runtime mutation by users or AI.
- **Readiness Layer (dynamic scoring)**: Calculates user readiness scores, never changes roadmaps.
- **AI Layer (advisory)**: Provides chat-based fitness guidance, never alters roadmaps.
- **User Execution Layer**: User actions and progress tracking, strictly separated from roadmap logic.
- **Admin Control Layer**: Admin management, never modifies user-specific roadmaps.

## Policy Enforcement

- All business logic and tests enforce strict separation and immutability as required by project rules.
