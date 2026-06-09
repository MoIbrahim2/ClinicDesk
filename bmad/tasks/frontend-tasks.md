# ClinicDesk Frontend Tasks

This file breaks the MVP frontend work into implementation-ready tasks aligned with the wireframes and API plan.

## Priority Order

1. App shell and shared setup
2. Authentication
3. Patients
4. Scheduling
5. Visits
6. Prescriptions
7. Billing
8. Dashboards
9. QA and polish

## App Shell And Shared Setup

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-FND-01 | Create React app structure aligned with Part 6 pages and components | None | todo |
| FE-FND-02 | Configure routing and protected route structure | FE-FND-01 | todo |
| FE-FND-03 | Configure API client and auth token handling | FE-FND-01 | todo |
| FE-FND-04 | Build shared app layout with sidebar, header, and content area | FE-FND-01 | todo |
| FE-FND-05 | Add language toggle and i18n setup | FE-FND-01 | todo |
| FE-FND-06 | Add RTL/LTR switching and page direction handling | FE-FND-05 | todo |
| FE-FND-07 | Add shared table, badge, modal, and page header components | FE-FND-04 | todo |

## Authentication

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-AUTH-01 | Build login page based on Part 5 wireframe | FE-FND-02 | todo |
| FE-AUTH-02 | Add login form validation and error states | FE-AUTH-01 | todo |
| FE-AUTH-03 | Connect login form to auth API | FE-FND-03 | todo |
| FE-AUTH-04 | Store auth session and current user state | FE-AUTH-03 | todo |
| FE-AUTH-05 | Redirect users to role-based dashboards after login | FE-AUTH-04 | todo |

## Patients

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-PAT-01 | Build patient list page with search and filters | FE-FND-07 | todo |
| FE-PAT-02 | Build patient create form | FE-FND-07 | todo |
| FE-PAT-03 | Build patient edit form | FE-PAT-02 | todo |
| FE-PAT-04 | Build patient detail page with tabs | FE-FND-07 | todo |
| FE-PAT-05 | Connect patient list to live APIs | FE-FND-03 | todo |
| FE-PAT-06 | Connect patient create and edit flows to live APIs | FE-FND-03 | todo |
| FE-PAT-07 | Connect patient detail page to live APIs | FE-FND-03 | todo |

## Scheduling

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-SCH-01 | Build appointment list page | FE-FND-07 | todo |
| FE-SCH-02 | Build appointment calendar page | FE-FND-07 | todo |
| FE-SCH-03 | Build appointment create modal or page | FE-FND-07 | todo |
| FE-SCH-04 | Build appointment edit or reschedule flow | FE-SCH-03 | todo |
| FE-SCH-05 | Show appointment statuses with clear visual states | FE-SCH-01 | todo |
| FE-SCH-06 | Connect appointment pages to live APIs | FE-FND-03 | todo |
| FE-SCH-07 | Surface conflict detection errors clearly in UI | FE-SCH-06 | todo |

## Visits

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-VIS-01 | Build visit or examination page from wireframe | FE-FND-07 | todo |
| FE-VIS-02 | Build vitals input section | FE-VIS-01 | todo |
| FE-VIS-03 | Build diagnosis section | FE-VIS-01 | todo |
| FE-VIS-04 | Show patient context and previous visits on visit screen | FE-VIS-01 | todo |
| FE-VIS-05 | Connect visit creation and completion to live APIs | FE-FND-03 | todo |

## Prescriptions

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-RX-01 | Build prescription form | FE-FND-07 | todo |
| FE-RX-02 | Build medication rows with add and remove actions | FE-RX-01 | todo |
| FE-RX-03 | Build print or preview prescription screen | FE-RX-01 | todo |
| FE-RX-04 | Connect prescription flow to live APIs | FE-FND-03 | todo |

## Billing And Payments

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-BILL-01 | Build invoice list page | FE-FND-07 | todo |
| FE-BILL-02 | Build invoice detail page | FE-BILL-01 | todo |
| FE-BILL-03 | Build payment recording form | FE-FND-07 | todo |
| FE-BILL-04 | Connect invoice and payment pages to live APIs | FE-FND-03 | todo |

## Dashboards And Notifications

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-DASH-01 | Build dashboard shell with role-aware rendering | FE-FND-04 | todo |
| FE-DASH-02 | Build receptionist dashboard cards and lists | FE-DASH-01 | todo |
| FE-DASH-03 | Build doctor dashboard cards and schedule list | FE-DASH-01 | todo |
| FE-DASH-04 | Build admin dashboard cards and charts | FE-DASH-01 | todo |
| FE-DASH-05 | Connect dashboards to live APIs | FE-FND-03 | todo |
| FE-NOTIF-01 | Add notification bell placeholder or basic dropdown | FE-FND-04 | todo |

## QA And Polish

| ID | Task | Depends On | Status |
|---|---|---|---|
| FE-QA-01 | Verify Arabic and English text flow on all demo pages | Core pages complete | todo |
| FE-QA-02 | Verify responsive behavior on login, dashboard, patients, appointments, and visit pages | Core pages complete | todo |
| FE-QA-03 | Add empty states, loading states, and error states to MVP pages | Core pages complete | todo |
| FE-QA-04 | Validate role-based navigation visibility | Auth and dashboard complete | todo |

## Frontend Definition Of Done

- the demo path is navigable without dead ends
- RTL and LTR both render correctly on core pages
- all MVP pages use live backend data
- validation and failure states are understandable to users

