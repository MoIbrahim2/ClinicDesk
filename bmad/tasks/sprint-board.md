# ClinicDesk MVP Sprint Board

This sprint board is derived from the project planning docs and includes only the core MVP implementation work needed for the hackathon demo.

## Source Documents

- `docs/part1_vision_requirements_stories.md`
- `docs/part2_usecases_domain.md`
- `docs/part3_database_architecture.md`
- `docs/part4_api_design.md`
- `docs/part5_wireframes_sprint_mvp.md`
- `docs/part6_techstack_structure_roadmap.md`

## Status Legend

- `todo`
- `in-progress`
- `blocked`
- `done`

## Demo Goal

The end-to-end demo path must support this sequence:

1. User logs in.
2. Receptionist registers a patient.
3. Receptionist books an appointment.
4. Doctor opens and completes the visit.
5. Doctor creates a prescription.
6. Receptionist generates or views the invoice.
7. Receptionist records payment.
8. Admin reviews dashboard data.

## Epic 1: Project Foundation

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| FND-01 | Create frontend app structure from Part 6 | Part 6 | Frontend | todo |
| FND-02 | Create backend app structure from Part 6 | Part 6 | Backend | todo |
| FND-03 | Configure environment variables for frontend, backend, and database | Part 6 | Backend | todo |
| FND-04 | Configure database connection and migration workflow | Part 3, Part 6 | Backend | todo |
| FND-05 | Add shared API response format and global error handling | Part 4 | Backend | todo |
| FND-06 | Add route protection and role-based access foundations | Part 1, Part 4 | Full Stack | todo |
| FND-07 | Add i18n setup for Arabic and English | Part 1, Part 6 | Frontend | todo |
| FND-08 | Add RTL/LTR switching support | Part 1, Part 5, Part 6 | Frontend | todo |

## Epic 2: Authentication And Roles

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| AUTH-01 | Create roles seed data: Guest, Patient, Receptionist, Doctor, Clinic Administrator | Part 1, Part 3 | Backend | todo |
| AUTH-02 | Implement users and roles entities | Part 3 | Backend | todo |
| AUTH-03 | Implement `POST /auth/register` | Part 4 | Backend | todo |
| AUTH-04 | Implement `POST /auth/login` | Part 4 | Backend | todo |
| AUTH-05 | Implement `POST /auth/refresh-token` | Part 4 | Backend | todo |
| AUTH-06 | Implement `GET /auth/me` | Part 4 | Backend | todo |
| AUTH-07 | Add password hashing and token issuance | Part 1, Part 4 | Backend | todo |
| AUTH-08 | Implement JWT auth guard and roles guard | Part 1, Part 4 | Backend | todo |
| AUTH-09 | Build login page UI | Part 5 | Frontend | todo |
| AUTH-10 | Connect login page to live auth API | Part 4, Part 5 | Frontend | todo |
| AUTH-11 | Redirect authenticated users to role-based dashboards | Part 2, Part 5 | Frontend | todo |

## Epic 3: Patient Management

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| PAT-01 | Implement patients entity and migration | Part 3 | Backend | todo |
| PAT-02 | Add patient ID generation rule | Part 1 | Backend | todo |
| PAT-03 | Implement `POST /patients` | Part 4 | Backend | todo |
| PAT-04 | Implement `GET /patients` with pagination and search | Part 1, Part 4 | Backend | todo |
| PAT-05 | Implement `GET /patients/:id` | Part 4 | Backend | todo |
| PAT-06 | Implement `PUT /patients/:id` | Part 4 | Backend | todo |
| PAT-07 | Implement soft delete behavior for patients | Part 1, Part 3 | Backend | todo |
| PAT-08 | Build patient list page | Part 5, Part 6 | Frontend | todo |
| PAT-09 | Build patient create and edit form | Part 5, Part 6 | Frontend | todo |
| PAT-10 | Build patient detail page | Part 5 | Frontend | todo |
| PAT-11 | Connect patient pages to live APIs | Part 4, Part 5 | Frontend | todo |

## Epic 4: Doctors, Services, And Scheduling

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| SCH-01 | Implement doctors entity and migration | Part 3 | Backend | todo |
| SCH-02 | Implement services entity and migration | Part 3 | Backend | todo |
| SCH-03 | Seed sample doctors and services | Part 3, Part 6 | Backend | todo |
| SCH-04 | Implement appointments entity and migration | Part 3 | Backend | todo |
| SCH-05 | Enforce appointment conflict detection for doctor/date/time | Part 1, Part 2 | Backend | todo |
| SCH-06 | Implement `POST /appointments` | Part 4 | Backend | todo |
| SCH-07 | Implement `GET /appointments` and calendar queries | Part 4 | Backend | todo |
| SCH-08 | Implement appointment reschedule flow | Part 1, Part 4 | Backend | todo |
| SCH-09 | Implement appointment cancel flow | Part 1, Part 4 | Backend | todo |
| SCH-10 | Build appointment list and calendar pages | Part 5, Part 6 | Frontend | todo |
| SCH-11 | Build appointment create and edit UI | Part 5, Part 6 | Frontend | todo |
| SCH-12 | Connect appointment pages to live APIs | Part 4, Part 5 | Frontend | todo |

## Epic 5: Visits And Examination

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| VIS-01 | Implement visits entity and migration | Part 3 | Backend | todo |
| VIS-02 | Implement diagnoses entity and migration | Part 3 | Backend | todo |
| VIS-03 | Implement start visit flow from appointment | Part 1, Part 2 | Backend | todo |
| VIS-04 | Implement `POST /visits` or equivalent create visit endpoint | Part 4, Part 3 | Backend | todo |
| VIS-05 | Implement visit completion logic that updates appointment status | Part 1, Part 4 | Backend | todo |
| VIS-06 | Implement patient previous-visit lookup from visit screen | Part 1, Part 2 | Backend | todo |
| VIS-07 | Build visit/examination form UI | Part 5 | Frontend | todo |
| VIS-08 | Build vitals and diagnosis sections | Part 1, Part 5 | Frontend | todo |
| VIS-09 | Connect visit form to live APIs | Part 4, Part 5 | Frontend | todo |

## Epic 6: Prescriptions

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| RX-01 | Implement prescriptions entity and migration | Part 3 | Backend | todo |
| RX-02 | Implement prescription items entity and migration | Part 3 | Backend | todo |
| RX-03 | Implement create prescription flow linked to visit | Part 1, Part 2 | Backend | todo |
| RX-04 | Implement prescription history lookup by patient | Part 1, Part 4 | Backend | todo |
| RX-05 | Build prescription form UI | Part 5, Part 6 | Frontend | todo |
| RX-06 | Build prescription print/preview page | Part 1, Part 5 | Frontend | todo |
| RX-07 | Connect prescription pages to live APIs | Part 4, Part 5 | Frontend | todo |

## Epic 7: Billing And Payments

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| BILL-01 | Implement invoices entity and migration | Part 3 | Backend | todo |
| BILL-02 | Implement invoice items entity and migration | Part 3 | Backend | todo |
| BILL-03 | Implement payments entity and migration | Part 3 | Backend | todo |
| BILL-04 | Implement invoice auto-generation from completed visit | Part 1, Part 2 | Backend | todo |
| BILL-05 | Implement `GET /patients/:id/invoices` and invoice detail API | Part 4 | Backend | todo |
| BILL-06 | Implement record payment flow | Part 1, Part 4 | Backend | todo |
| BILL-07 | Build invoice list/detail UI | Part 5, Part 6 | Frontend | todo |
| BILL-08 | Build payment recording UI | Part 5, Part 6 | Frontend | todo |
| BILL-09 | Connect billing pages to live APIs | Part 4, Part 5 | Frontend | todo |

## Epic 8: Dashboards And Notifications

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| DASH-01 | Implement dashboard aggregation queries for receptionist | Part 1, Part 4 | Backend | todo |
| DASH-02 | Implement dashboard aggregation queries for doctor | Part 1, Part 4 | Backend | todo |
| DASH-03 | Implement dashboard aggregation queries for admin | Part 1, Part 4 | Backend | todo |
| DASH-04 | Build dashboard shell and role-based dashboard views | Part 5 | Frontend | todo |
| DASH-05 | Connect dashboard UI to live APIs | Part 4, Part 5 | Frontend | todo |
| NOTIF-01 | Implement notifications entity and migration | Part 3 | Backend | todo |
| NOTIF-02 | Add notification bell UI placeholder or MVP list | Part 5, Part 6 | Frontend | todo |

## Epic 9: Audit, Demo Data, And QA

| ID | Task | Source | Owner | Status |
|---|---|---|---|---|
| QA-01 | Implement audit logs entity and migration | Part 3 | Backend | todo |
| QA-02 | Log critical actions: login, patient creation, appointment creation, payment recording | Part 1, Part 2, Part 3 | Backend | todo |
| QA-03 | Create demo seed data for clinic settings, staff, patients, doctors, services, and appointments | Part 3, Part 5, Part 6 | Full Stack | todo |
| QA-04 | Run full happy-path integration test manually | All Parts | Full Stack | todo |
| QA-05 | Verify role access boundaries for receptionist, doctor, and admin | Part 1, Part 2, Part 4 | Full Stack | todo |
| QA-06 | Verify Arabic and English layout behavior | Part 1, Part 5, Part 6 | Frontend | todo |
| QA-07 | Create final demo walkthrough notes | Part 5, Part 6 | Full Stack | todo |

## Recommended Build Order

1. `FND-01` to `FND-08`
2. `AUTH-01` to `AUTH-11`
3. `PAT-01` to `PAT-11`
4. `SCH-01` to `SCH-12`
5. `VIS-01` to `VIS-09`
6. `RX-01` to `RX-07`
7. `BILL-01` to `BILL-09`
8. `DASH-01` to `DASH-05`
9. `QA-01` to `QA-07`

## Minimum Hackathon Cut Line

If time gets tight, the minimum deliverable should still include:

- login with roles
- patient create/search/detail
- appointment booking with conflict detection
- visit completion
- prescription creation
- invoice and payment recording
- one working admin or receptionist dashboard

## Suggested Next Files

Create these next if you want tighter execution tracking:

- `bmad/tasks/backend-tasks.md`
- `bmad/tasks/frontend-tasks.md`
- `bmad/tasks/integration-tasks.md`
- `bmad/tasks/demo-checklist.md`
