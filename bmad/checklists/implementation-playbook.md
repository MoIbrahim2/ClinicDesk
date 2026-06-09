# ClinicDesk BMAD Implementation Playbook

This is the step-by-step path to execute the project using the existing Markdown requirements.

## Phase 1: Lock The MVP

Read:

- `docs/part1_vision_requirements_stories.md`

Do:

1. Copy only `Must Have` requirements into the sprint board.
2. Freeze `Should Have`, `Nice to Have`, and post-MVP features.
3. Agree on one demo journey:
   - login
   - register patient
   - book appointment
   - complete visit
   - create prescription
   - create invoice
   - record payment

Definition of done:

- everyone on the team is building the same MVP, not personal interpretations of it

## Phase 2: Build The Domain Model

Read:

- `docs/part2_usecases_domain.md`
- `docs/part3_database_architecture.md`

Do:

1. Create the database entities for the MVP first:
   - roles
   - users
   - patients
   - doctors
   - services
   - appointments
   - visits
   - diagnoses
   - prescriptions
   - prescription_items
   - invoices
   - invoice_items
   - payments
   - notifications
   - clinic_settings
   - audit_logs
2. Implement key enums and constraints.
3. Seed minimum reference data:
   - roles
   - sample admin
   - sample receptionist
   - sample doctor
   - clinic settings
4. Decide what can wait:
   - attachments
   - advanced reports
   - patient self-service

Definition of done:

- schema supports the whole happy path without fake placeholders

## Phase 3: Scaffold The Backend

Read:

- `docs/part4_api_design.md`
- `docs/part6_techstack_structure_roadmap.md`

Do:

1. Create backend modules in this order:
   - auth
   - patients
   - appointments
   - visits
   - prescriptions
   - billing
   - dashboard
2. Implement auth first:
   - login
   - register
   - refresh token
   - current user
   - role guards
3. Add validation DTOs for all create/update requests.
4. Standardize API responses.
5. Add Swagger early so frontend can test endpoints as they appear.

Definition of done:

- frontend can log in and consume real APIs for the core flow

## Phase 4: Scaffold The Frontend

Read:

- `docs/part5_wireframes_sprint_mvp.md`
- `docs/part6_techstack_structure_roadmap.md`

Do:

1. Create frontend pages in this order:
   - login
   - dashboard shell
   - patient list/detail
   - appointment calendar/list
   - visit form
   - prescription preview
   - invoice/payment pages
2. Build a shared layout:
   - sidebar
   - top header
   - language toggle
   - notification bell
3. Add RTL support from the beginning.
4. Connect pages to live APIs one slice at a time.

Definition of done:

- the wireframes are represented by working screens, not just static components

## Phase 5: Integrate By Feature Slice

Do not build backend and frontend as separate islands for too long.

Integrate in this order:

1. Authentication
2. Patient management
3. Appointment scheduling
4. Visit/examination
5. Prescription
6. Billing
7. Dashboard

For each slice:

1. create database support
2. implement backend API
3. build frontend UI
4. connect and test the flow
5. mark the slice complete

Definition of done:

- each slice works end-to-end before the team starts the next one

## Phase 6: Delivery And Demo

Do:

1. Seed realistic clinic demo data.
2. Test the full happy path.
3. Test role-based access for doctor, receptionist, and admin.
4. Test Arabic/English switching.
5. Verify no broken pages in the demo path.
6. Prepare a short spoken walkthrough for the judges.

Definition of done:

- the team can reliably demo the product in one uninterrupted flow

## Suggested Team Split For 5 Developers

1. Backend auth and shared infrastructure
2. Backend clinic modules and database
3. Frontend shell, auth, and dashboard
4. Frontend patient, appointments, and visits
5. QA, integration, billing, prescription, and demo data

## Daily Execution Rule

At the start of each work block:

1. check the current BMAD phase
2. pick one feature slice
3. work from requirement to model to API to UI
4. test the slice
5. update status

## What To Ask MCP For

Use prompts like:

- `Read the part1 to part6 docs and extract only Must Have MVP tasks`
- `Generate NestJS entities from the ERD in part3`
- `Create DTOs and controllers for the patients module based on part4`
- `Build the React patient list page based on part5 and part6`
- `Check whether the appointment flow matches the documented requirements`

