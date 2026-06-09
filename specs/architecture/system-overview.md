# System Overview

## Domain Model Summary

ClinicDesk is a single-clinic, bilingual web-based clinic management system for small and medium clinics in the MENA region. The core domain centers on users, patients, doctors, appointments, visits, prescriptions, invoices, payments, notifications, clinic settings, services, and audit logs.

Key domain relationships:
- A `User` may have a linked `Patient` profile or `Doctor` profile depending on role.
- A `Patient` can have many appointments, visits, prescriptions, invoices, payments, notifications, and medical reports.
- A `Doctor` can have many appointments, visits, prescriptions, and managed availability rules.
- An `Appointment` belongs to one patient and one doctor, and can lead to one visit.
- A `Visit` belongs to one appointment and patient, stores vitals and notes, and can have diagnoses and prescriptions.
- A `Prescription` belongs to one visit and contains one or more prescription items.
- An `Invoice` may be generated from a visit or created manually, includes invoice items, and accepts one or more payments.
- `ClinicSettings` acts as a singleton aggregate for clinic-wide configuration.
- `AuditLogs` record sensitive create, update, and delete operations in an append-only format.

## System Architecture

ClinicDesk follows a modular client-server architecture:
- Frontend: React 18 SPA built with Vite.
- Backend: NestJS 10 REST API with modular domain boundaries.
- Database: MySQL 8 relational database.
- Infrastructure: Docker Compose for local orchestration, with Nginx as reverse proxy.

Primary architectural characteristics:
- Single-clinic deployment for MVP, with future growth to multiple clinics considered in schema and module design.
- Stateless application layer using JWT access and refresh tokens.
- Domain-driven backend modules aligned with business capabilities.
- Feature-oriented frontend structure aligned with route and domain boundaries.
- Bilingual Arabic RTL and English LTR support as a first-class system concern.

## Backend Architecture

The backend uses a layered NestJS module pattern:
- Controller: request/response handling and route exposure.
- Service: business rules and workflow orchestration.
- Repository/ORM: persistence via TypeORM entities and repositories.

Planned backend modules:
- Auth
- Users
- Patients
- Doctors
- Appointments
- Visits
- Prescriptions
- Billing
- Reports
- Notifications
- Admin
- Clinic Settings

Backend conventions and requirements:
- DTO validation with `class-validator` and `class-transformer`.
- Swagger/OpenAPI documentation at `/api/docs`.
- Structured JSON error responses with a global exception handler.
- Role-based authorization enforced with guards and decorators.
- Audit logging on sensitive entities and operations.
- Local file storage for MVP uploads, with a future adapter path for object storage.

## Frontend Architecture

The frontend follows a feature-based React structure on top of shared application layers:
- `api/` for Axios-based backend communication.
- `components/common/` for reusable UI primitives.
- `components/{domain}/` for feature-specific UI.
- `contexts/` for auth, language, and shared global state.
- `hooks/` for reusable stateful logic.
- `pages/` for route-level screens.
- `routes/` for protected and role-aware navigation.
- `utils/` for pure helpers and formatting.

Frontend technology and UX expectations:
- React Router v6 for nested routing and protected routes.
- React Query for server-state caching and synchronization.
- Ant Design 5 for RTL-ready forms, tables, layouts, and navigation.
- `i18next` with JSON locale files for Arabic and English.
- Recharts for dashboard analytics.
- React Hook Form with Zod for validated forms.
- Responsive, desktop-first layouts that remain mobile-friendly.

## Security Requirements

The architecture must satisfy the documented security and compliance-oriented requirements:
- Enforce HTTPS with TLS 1.2+.
- Use short-lived JWT access tokens and 7-day refresh tokens stored in HTTP-only, secure, SameSite cookies.
- Hash passwords with bcrypt cost factor 12 or higher.
- Enforce RBAC on routes and APIs for Guest, Patient, Receptionist, Doctor, and Clinic Administrator roles.
- Validate and sanitize all inputs on both client and server.
- Protect against SQL injection, XSS, and CSRF.
- Apply rate limiting to authentication endpoints.
- Encrypt sensitive patient medical data at rest with AES-256.
- Maintain append-only audit trails for sensitive operations.
- Retain audit records for at least one year.

## Integration Requirements

MVP integrations are intentionally limited to reduce hackathon risk, but several integration boundaries are defined:
- Email integration for password reset and optional critical notifications via Nodemailer.
- Print/export support for prescriptions, invoices, and receipts in Arabic and English layouts.
- File upload support for optional visit attachments.
- Reverse-proxy deployment through Nginx in Docker Compose.

Explicit MVP non-integrations:
- No HL7/FHIR interoperability.
- No insurance claims integration.
- No SMS/WhatsApp reminders in MVP.
- No external lab or imaging device integrations.
- No multi-tenant SaaS platform concerns in the first release.
