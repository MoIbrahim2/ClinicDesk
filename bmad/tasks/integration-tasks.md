# ClinicDesk Integration Tasks

This file tracks end-to-end feature slices so the team does not leave backend and frontend disconnected.

## Integration Rule

A slice is only `done` when:

1. DB support exists
2. backend API works
3. frontend UI works
4. role access is correct
5. manual happy-path test passes

## Slice 1: Authentication

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-01 | Login flow works end to end | Auth APIs, JWT, roles | Login page, session state, redirects | todo |
| INT-02 | Current user loading works after refresh | `/auth/me`, refresh token | App bootstrap and protected routes | todo |
| INT-03 | Role-based route access works | Guards | Role-aware navigation | todo |

## Slice 2: Patient Management

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-04 | Receptionist can create a patient | Patient create API | Patient form | todo |
| INT-05 | Receptionist or doctor can search patients | Patient list API | Patient list and search UI | todo |
| INT-06 | Patient detail page shows core profile data | Patient detail API | Patient detail screen | todo |

## Slice 3: Appointment Scheduling

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-07 | Receptionist can book appointment for a patient | Appointment create API | Appointment form | todo |
| INT-08 | Conflict detection blocks double booking | Conflict validation | UI error handling | todo |
| INT-09 | Appointment list and calendar show saved appointments | Appointment queries | List and calendar views | todo |

## Slice 4: Visits

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-10 | Doctor can start a visit from an appointment | Visit start logic | Visit action from schedule | todo |
| INT-11 | Doctor can complete visit with vitals and diagnosis | Visit save and complete APIs | Visit form | todo |
| INT-12 | Completed visit updates appointment status | Visit completion logic | Schedule reflects new status | todo |

## Slice 5: Prescriptions

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-13 | Doctor can create prescription from visit | Prescription APIs | Prescription form | todo |
| INT-14 | Prescription preview is printable and linked to patient visit | Prescription query | Preview page | todo |

## Slice 6: Billing

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-15 | Completed visit creates or exposes invoice | Invoice generation logic | Invoice list/detail | todo |
| INT-16 | Receptionist can record payment | Payment API | Payment form | todo |
| INT-17 | Invoice payment status updates correctly | Payment and invoice logic | UI refresh and status badge | todo |

## Slice 7: Dashboard

| ID | Task | Backend | Frontend | Status |
|---|---|---|---|---|
| INT-18 | Receptionist dashboard shows live appointment and billing summary | Dashboard aggregation | Dashboard view | todo |
| INT-19 | Doctor dashboard shows live queue and visit summary | Dashboard aggregation | Dashboard view | todo |
| INT-20 | Admin dashboard shows live totals and charts | Dashboard aggregation | Dashboard view | todo |

## Cross-Cutting Checks

| ID | Task | Status |
|---|---|---|
| INT-21 | Arabic and English switching works on demo path | todo |
| INT-22 | Role navigation hides unauthorized pages | todo |
| INT-23 | Audit logs capture critical demo actions | todo |
| INT-24 | Demo seed data supports the full walkthrough | todo |

## Recommended Integration Sequence

1. INT-01 to INT-03
2. INT-04 to INT-06
3. INT-07 to INT-09
4. INT-10 to INT-12
5. INT-13 to INT-14
6. INT-15 to INT-17
7. INT-18 to INT-24

