# Architecture Overview

## Layered Architecture

- **Roadmap Layer (immutable)**: Predefined, static, versioned fitness roadmaps.
- **Readiness Layer (dynamic scoring)**: Calculates user readiness scores.
- **AI Layer (advisory)**: Provides chat-based fitness guidance, never alters roadmaps.
- **User Execution Layer**: User actions and progress tracking.
- **Admin Control Layer**: Admin management, never modifies roadmaps.

## Decisions
- Roadmaps are strictly immutable and versioned.
- AI is advisory-only and cannot change core data.
- All business logic must respect these boundaries.
