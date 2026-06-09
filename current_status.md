# ClinicDesk Current Status

Use this file as the primary handoff note when switching:

- laptops
- AI models
- Codex / Antigravity / other sessions

## Project Summary

ClinicDesk is a hackathon MVP for a web-based clinic management system. The planning and execution structure is already documented in:

- `docs/`

The repository contains:

- Comprehensive planning and architecture documents.
- Fully operational NestJS + MySQL Dockerized backend API.
- Integration test suite validating the entire backend API surface.
- Frontend React + Vite shell scaffold.

## Source Of Truth

Read these first before continuing:

1. `README.md`
2. `docs/STATE.md`
3. `docs/part1_vision_requirements_stories.md`
4. `docs/part3_database_architecture.md`
5. `docs/part4_api_design.md`
6. `docs/part5_wireframes_sprint_mvp.md`
7. `docs/part6_techstack_structure_roadmap.md`
8. `tasks/backlog.md`

## Current State

### Completed

- **Database Setup**: Seeded roles and administrative credentials. Schema synchronizes automatically inside Docker.
- **Authentication & RBAC**: Password hashing, JWT token rotation (HttpOnly cookie), custom role guards, and user profile endpoints.
- **Patient Management**: Patient registration, CRUD operations, paginated search, and bilingual validations.
- **Doctor Management**: Staff setups, licensing uniqueness, and working hours JSON-based availability.
- **Appointment Scheduling**: Availability-aware booking, double-booking prevention, calendar queries, and status updates.
- **Visit & Examination Workflow**: Vital signs validation, diagnosis finalization rules, and immutable finalized visit state.
- **Prescription System**: Multi-item validation, draft check, and same-visit/cross-visit cloning mechanics.
- **Billing & Invoicing**: Automated consultation invoice generation, manual invoice creation, tax/discount computations, payment processing, balance tracking, and aggregate admin financial summaries.
- **Test Coverage**: Seven Python integration scripts under the persistent workspace directory verifying all flows (Auth, Patients, Doctors, Appointments, Visits, Prescriptions, Billing).

### Not Yet Completed / In Progress

- **Frontend Core Layout**: Bilingual Shell (English/Arabic, LTR/RTL) with theme configurations.
- **Frontend Views**: Interactive pages for registration, patient files, appointment scheduling, visits, prescriptions, and billing forms.
- **Dashboards**: Receptionist, doctor, and admin analytics dashboards with live metrics.

## Current Priority

The highest-priority next step is:

1. Build the shared bilingual layout (Shell) in the React + Vite frontend supporting RTL/LTR toggles.
2. Implement front-end authentication pages (Login/Registration) integrating with the backend endpoints.
3. Build the core patient management front-end dashboard using Stitch-generated screens.

## Recommended Next Prompt

Use this prompt in the next session:

```text
Read docs/STATE.md, current_status.md, and tasks/backlog.md. Implement the bilingual front-end Shell layout (English/Arabic, LTR/RTL toggle) and the authentication user interface (Login/Register screens) for the React frontend, linking them to the backend API.
```

## How To Run The Project

### Running the Backend & DB:
From the workspace root:
```bash
docker compose up -d --build
```
This starts the MySQL database (`clinic_desk_db`), the NestJS backend API (`clinic_desk_backend`), and Nginx routing (`clinic_desk_nginx`).

### Running Backend Tests:
To run the complete integration suite:
```bash
python3 /home/noorelmobashar/.gemini/antigravity/brain/f4f67ba0-f8a1-4301-a6d3-d288d76e3847/scratch/test_billing.py
```
*(Tests exist for auth, patients, doctors, appointments, visits, prescriptions, and billing in the same scratch folder)*

### Running the Frontend:
From `clinic-desk-frontend/`:
```bash
npm run dev
```

## Notes

- All backend monetary calculations must remain wrapped in numeric type coercions (e.g. `Number(...)`) to avoid TypeORM database string conversions.
- Use Stitch for generating React components and Vanilla CSS to align with the visual and performance requirements.
