# ClinicDesk Backend Tasks

This file breaks the MVP backend work into implementation-ready tasks derived from the sprint board and planning docs.

## Priority Order

1. Foundation
2. Authentication
3. Patients
4. Scheduling
5. Visits
6. Prescriptions
7. Billing
8. Dashboard
9. Audit and seed data

## Foundation

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-FND-01 | Create NestJS project structure aligned with Part 6 modules | None | todo |
| BE-FND-02 | Configure environment handling for API, JWT, DB, and CORS | BE-FND-01 | todo |
| BE-FND-03 | Configure MySQL connection and ORM setup | BE-FND-01 | todo |
| BE-FND-04 | Add migration workflow and naming convention | BE-FND-03 | todo |
| BE-FND-05 | Add global validation pipe and DTO validation pattern | BE-FND-01 | todo |
| BE-FND-06 | Add unified API response wrapper and exception filter | BE-FND-01 | todo |
| BE-FND-07 | Add Swagger setup for all modules | BE-FND-01 | todo |

## Authentication And Roles

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-AUTH-01 | Create `roles` entity and migration | BE-FND-03 | todo |
| BE-AUTH-02 | Create `users` entity and migration | BE-AUTH-01 | todo |
| BE-AUTH-03 | Seed system roles | BE-AUTH-01 | todo |
| BE-AUTH-04 | Implement password hashing with bcrypt | BE-AUTH-02 | todo |
| BE-AUTH-05 | Implement JWT access token generation | BE-AUTH-02 | todo |
| BE-AUTH-06 | Implement refresh token flow | BE-AUTH-05 | todo |
| BE-AUTH-07 | Implement `POST /auth/register` | BE-AUTH-04 | todo |
| BE-AUTH-08 | Implement `POST /auth/login` | BE-AUTH-04 | todo |
| BE-AUTH-09 | Implement `POST /auth/refresh-token` | BE-AUTH-06 | todo |
| BE-AUTH-10 | Implement `GET /auth/me` | BE-AUTH-08 | todo |
| BE-AUTH-11 | Implement JWT guard and roles guard | BE-AUTH-05 | todo |

## Patients

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-PAT-01 | Create `patients` entity and migration | BE-AUTH-02 | todo |
| BE-PAT-02 | Implement patient ID generation | BE-PAT-01 | todo |
| BE-PAT-03 | Implement create patient DTO and service | BE-PAT-01 | todo |
| BE-PAT-04 | Implement `POST /patients` | BE-PAT-03 | todo |
| BE-PAT-05 | Implement search, pagination, and filters for `GET /patients` | BE-PAT-01 | todo |
| BE-PAT-06 | Implement `GET /patients/:id` | BE-PAT-01 | todo |
| BE-PAT-07 | Implement `PUT /patients/:id` | BE-PAT-01 | todo |
| BE-PAT-08 | Implement soft delete or inactive flag behavior | BE-PAT-01 | todo |

## Doctors, Services, And Appointments

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-SCH-01 | Create `doctors` entity and migration | BE-AUTH-02 | todo |
| BE-SCH-02 | Create `services` entity and migration | BE-FND-03 | todo |
| BE-SCH-03 | Create `appointments` entity and migration | BE-PAT-01, BE-SCH-01, BE-SCH-02 | todo |
| BE-SCH-04 | Seed sample doctors and services | BE-SCH-01, BE-SCH-02 | todo |
| BE-SCH-05 | Implement create appointment DTO and service | BE-SCH-03 | todo |
| BE-SCH-06 | Implement conflict detection for doctor/date/time slot | BE-SCH-05 | todo |
| BE-SCH-07 | Implement `POST /appointments` | BE-SCH-06 | todo |
| BE-SCH-08 | Implement `GET /appointments` list and calendar queries | BE-SCH-03 | todo |
| BE-SCH-09 | Implement appointment reschedule endpoint or action | BE-SCH-03 | todo |
| BE-SCH-10 | Implement appointment cancel endpoint or action | BE-SCH-03 | todo |

## Visits And Diagnoses

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-VIS-01 | Create `visits` entity and migration | BE-SCH-03 | todo |
| BE-VIS-02 | Create `diagnoses` entity and migration | BE-VIS-01 | todo |
| BE-VIS-03 | Implement start visit from appointment | BE-VIS-01 | todo |
| BE-VIS-04 | Implement create visit DTO and service | BE-VIS-01 | todo |
| BE-VIS-05 | Implement visit completion logic | BE-VIS-04 | todo |
| BE-VIS-06 | Update appointment status when visit is completed | BE-VIS-05 | todo |
| BE-VIS-07 | Implement patient previous visits lookup | BE-VIS-01 | todo |

## Prescriptions

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-RX-01 | Create `prescriptions` entity and migration | BE-VIS-01 | todo |
| BE-RX-02 | Create `prescription_items` entity and migration | BE-RX-01 | todo |
| BE-RX-03 | Implement create prescription DTO and service | BE-RX-02 | todo |
| BE-RX-04 | Implement create prescription endpoint | BE-RX-03 | todo |
| BE-RX-05 | Implement prescription history lookup by patient | BE-RX-01 | todo |

## Billing And Payments

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-BILL-01 | Create `invoices` entity and migration | BE-PAT-01, BE-VIS-01 | todo |
| BE-BILL-02 | Create `invoice_items` entity and migration | BE-BILL-01 | todo |
| BE-BILL-03 | Create `payments` entity and migration | BE-BILL-01 | todo |
| BE-BILL-04 | Implement invoice creation from completed visit | BE-BILL-01, BE-VIS-05 | todo |
| BE-BILL-05 | Implement invoice detail and patient invoice history queries | BE-BILL-01 | todo |
| BE-BILL-06 | Implement record payment DTO and service | BE-BILL-03 | todo |
| BE-BILL-07 | Implement payment status updates on invoice | BE-BILL-06 | todo |

## Dashboard And Notifications

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-DASH-01 | Implement receptionist dashboard aggregation queries | BE-SCH-03, BE-BILL-01 | todo |
| BE-DASH-02 | Implement doctor dashboard aggregation queries | BE-VIS-01 | todo |
| BE-DASH-03 | Implement admin dashboard aggregation queries | BE-PAT-01, BE-SCH-03, BE-BILL-01 | todo |
| BE-NOTIF-01 | Create `notifications` entity and migration | BE-AUTH-02 | todo |
| BE-NOTIF-02 | Add minimal notification retrieval endpoint if time allows | BE-NOTIF-01 | todo |

## Audit And Demo Data

| ID | Task | Depends On | Status |
|---|---|---|---|
| BE-QA-01 | Create `audit_logs` entity and migration | BE-AUTH-02 | todo |
| BE-QA-02 | Log login events | BE-QA-01, BE-AUTH-08 | todo |
| BE-QA-03 | Log patient creation, appointment creation, and payment events | BE-QA-01 | todo |
| BE-QA-04 | Seed clinic settings | BE-FND-03 | todo |
| BE-QA-05 | Seed admin, receptionist, doctor, patient, services, and appointments demo data | Core entities complete | todo |

## Backend Definition Of Done

- Swagger documents the implemented endpoints
- all MVP modules compile and run together
- key APIs are protected by role checks
- the demo path works with real DB data

