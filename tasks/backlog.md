# Backlog

## Sprint 1

Goal: establish the MVP foundation and the minimum end-to-end operational flow.

- [x] Set up the frontend, backend, database, Docker Compose, and shared development conventions.
- [x] Implement authentication and authorization with JWT, refresh flow, protected routes, and role-aware navigation.
- [x] Seed roles and baseline admin user data.
- [x] Implement patient management CRUD, patient search, and patient detail foundations. (Completed)
- [x] Implement doctor management essentials needed for booking and staff setup. (Completed)
- [x] Implement appointment scheduling CRUD, status model, conflict detection, and calendar views. (Completed)
- [x] Deliver bilingual shell support including language toggle and RTL/LTR switching.
- [x] Build shared frontend primitives for tables, forms, headers, status badges, and confirmation dialogs.

## Sprint 2

Goal: complete the clinical workflow from appointment through visit and prescription, with dashboard visibility.

- [x] Implement visit and examination workflows, vitals capture, diagnosis recording, and prior-visit access. (Completed)
- [x] Implement prescription creation, prescription history, and printable bilingual prescription views. (Completed)
- [x] Build receptionist, doctor, and admin dashboard foundations with live KPIs. (Completed)
- [x] Implement reporting endpoints for dashboard data and early financial/operational summaries. (Completed)
- [x] Implement notification center basics, unread counts, mark-read flows, and doctor check-in notifications. (Completed)
- [x] Expand patient details with timeline, visits, prescriptions, and linked history tabs. (Completed)

## Sprint 3

Goal: complete business operations, governance features, and demo-ready polish around the MVP.

- [x] Implement billing, invoicing, invoice generation from visits, and payment recording. (Completed)
- [x] Implement receipt and invoice print/export flows. (Completed)
- [x] Implement clinic administration for services, staff oversight, and clinic settings.
- [x] Implement audit-log viewing and filtering for administrators.
- [x] Complete revenue reports and reporting filters by date, doctor, and payment method. (Completed)
- [x] Add hardening for validation, error handling, security controls, and key tests for RBAC, conflict detection, and billing calculations.
- [/] Finish responsive polish, accessibility checks, and bilingual print verification.

MVP-first priority order across sprints:
- Authentication and authorization
- Patient management
- Doctor setup and availability basics
- Appointment scheduling
- Visits and examinations
- Prescriptions
- Billing and payments
- Role dashboards

Deferred beyond MVP when time is constrained:
- Patient self-service appointment requests
- Medication autocomplete catalog depth
- Draft/amendment sophistication for visits
- Advanced charting and report export
- Reminder scheduling beyond in-app basics
- Broadcast announcements
- Drug-allergy interaction checks
