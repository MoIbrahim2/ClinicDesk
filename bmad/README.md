# BMAD Workspace

This folder reorganizes the project into a working structure that maps directly to the planning package.

## Sections

- `business/`: what we are building and why
- `model/`: what data and rules the system needs
- `application/`: how the app is implemented
- `delivery/`: how we ship, verify, and demo it
- `checklists/`: step-by-step execution guides
- `tasks/`: sprint tasks or owner-based task breakdowns

## Mapping From Existing Docs

| BMAD Area | Source Docs | Main Purpose |
|---|---|---|
| Business | `docs/part1_vision_requirements_stories.md` | Vision, scope, MVP, priorities |
| Model | `docs/part2_usecases_domain.md`, `docs/part3_database_architecture.md` | Use cases, domain analysis, ERD, rules |
| Application | `docs/part4_api_design.md`, `docs/part6_techstack_structure_roadmap.md` | API contracts, modules, stack, structure |
| Delivery | `docs/part5_wireframes_sprint_mvp.md`, `docs/part6_techstack_structure_roadmap.md` | UI flows, sprinting, roadmap, demo |

## How To Use With MCP

Use MCP tools as execution helpers inside each BMAD stage:

1. `Business`
   - Summarize requirements
   - Extract only `Must Have` scope
   - Turn stories into backlog items
2. `Model`
   - Turn entities into DB schema
   - Turn use cases into validation and business rules
   - Generate module/entity/task checklists
3. `Application`
   - Scaffold backend modules and frontend pages
   - Implement route handlers, forms, tables, and auth guards
   - Cross-check APIs against UI screens
4. `Delivery`
   - Verify flows in browser
   - Track completion against MVP
   - Prepare demo script and known gaps

## Rule For This Hackathon

Always build `Must Have` features end-to-end before touching `Should Have` or `Nice to Have`.

