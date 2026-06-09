# ClinicDesk Current Status

Use this file as the primary handoff note when switching:

- laptops
- AI models
- Codex / Antigravity / other sessions

## Project Summary

ClinicDesk is a hackathon MVP for a web-based clinic management system. The planning and execution structure is already documented in:

- `docs/`
- `bmad/`

The repo currently contains:

- planning documents
- BMAD execution files
- MCP setup templates

The repo does **not yet** contain a confirmed full frontend/backend implementation based on the planning docs.

## Source Of Truth

Read these first before continuing:

1. `README.md`
2. `docs/part1_vision_requirements_stories.md`
3. `docs/part3_database_architecture.md`
4. `docs/part4_api_design.md`
5. `docs/part5_wireframes_sprint_mvp.md`
6. `docs/part6_techstack_structure_roadmap.md`
7. `bmad/tasks/sprint-board.md`
8. `bmad/tasks/backend-tasks.md`
9. `bmad/tasks/frontend-tasks.md`
10. `bmad/tasks/integration-tasks.md`
11. `bmad/tasks/demo-checklist.md`

## Current State

### Completed

- BMAD workspace created
- README updated to explain BMAD workflow
- sprint board created
- backend tasks created
- frontend tasks created
- integration tasks created
- demo checklist created
- MCP templates created for Codex, Claude Desktop, and Antigravity

### Not Yet Confirmed Implemented

- actual frontend application scaffold
- actual backend application scaffold
- database schema/migrations
- auth flow
- patient management flow
- appointments flow
- visits flow
- prescriptions flow
- billing flow
- dashboard flow

## Current Priority

The highest-priority next step is:

1. inspect the repo for any newly added frontend/backend code
2. if missing, scaffold the real frontend and backend structure from `docs/part6_techstack_structure_roadmap.md`
3. then implement the first MVP vertical slice:
   - backend foundation
   - frontend foundation
   - authentication
   - patient management

## MVP Must-Have Scope

The minimum hackathon cut line is:

- login with roles
- patient create/search/detail
- appointment booking with conflict detection
- visit completion
- prescription creation
- invoice and payment recording
- one working admin or receptionist dashboard

## Recommended Next Prompt

Use this prompt in a fresh AI session:

```text
Read README.md, docs/, bmad/, and the current codebase. Summarize what is already implemented, what remains for the Must Have MVP, and continue with the highest-priority unfinished task. Focus on the ClinicDesk hackathon MVP only.
```

## When Work Advances

Update this file with:

- what was completed
- what files were added
- what is currently broken
- what task should happen next
- any setup commands needed to run the project

## Notes

- Prefer end-to-end feature slices over isolated partial work.
- Stay aligned with the planning docs unless the team explicitly decides otherwise.
- If time becomes tight, optimize for the demo path first.
- Use Stitch for the UI screens based on the wireframes.
