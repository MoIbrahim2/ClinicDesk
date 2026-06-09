# ClinicDesk — Part 1: Vision, Requirements & User Stories

> **Project:** ClinicDesk — Web-Based Clinic Management System  
> **Version:** 1.0  
> **Date:** 2026-06-09  
> **Status:** Draft  
> **Languages:** Arabic (RTL) · English (LTR)

---

## Table of Contents

1. [Vision Document](#1-vision-document)
2. [Requirements Specification](#2-requirements-specification)
   - [Functional Requirements](#21-functional-requirements)
   - [Non-Functional Requirements](#22-non-functional-requirements)
3. [User Stories](#3-user-stories)

---

## 1. Vision Document

### 1.1 Problem Statement

Small and medium-sized clinics across the MENA region continue to rely on **paper-based records, fragmented spreadsheets, and disconnected communication channels** to manage their day-to-day operations. This leads to a cascade of preventable problems:

| Pain Point | Impact |
|---|---|
| **Paper medical records** | Records are lost, misfiled, or illegible — leading to diagnostic errors and repeated tests. |
| **Manual appointment scheduling** | Double-bookings, no-shows without follow-up, and long patient wait times erode trust and revenue. |
| **Handwritten prescriptions** | Dosage errors, pharmacy call-backs, and patient confusion increase liability. |
| **Disconnected billing** | Revenue leakage from un-invoiced services; no consolidated financial view for clinic owners. |
| **No centralized dashboard** | Clinic administrators lack real-time visibility into operational performance and cannot make data-driven decisions. |
| **Language barriers** | Existing solutions are predominantly English-only, alienating Arabic-speaking staff and patients. |

These inefficiencies cost clinics **time, money, and patient satisfaction**. Larger hospital information systems (HIS) exist but are prohibitively expensive, complex to deploy, and over-engineered for a 2–15 doctor practice.

### 1.2 Target Users

**Primary Market:** Small-to-medium clinics (1–15 physicians) in the **MENA region** — particularly in Egypt, Saudi Arabia, Jordan, UAE, and Iraq.

**User Personas:**

| Persona | Description | Tech Comfort |
|---|---|---|
| **Dr. Ahmed** | General practitioner running a solo clinic. Needs fast examination recording and prescription printing. | Moderate |
| **Nour (Receptionist)** | Front-desk staff juggling phone bookings, walk-ins, and billing. Needs a single screen for scheduling and invoicing. | Low–Moderate |
| **Fatima (Clinic Administrator)** | Clinic owner/manager who wants financial reports, staff oversight, and operational KPIs. | Moderate–High |
| **Omar (Patient)** | Wants to book online, view upcoming appointments, and access prescription history. | Variable |
| **Guest Visitor** | Prospective patient browsing clinic info, services, and doctor profiles before registering. | Variable |

### 1.3 Business Goals & Success Metrics

#### Goals

1. **Digitize core clinic workflows** — appointments, examinations, prescriptions, and billing — into a single, unified web application.
2. **Deliver a fully bilingual (Arabic RTL + English LTR) experience** to serve the underserved MENA market.
3. **Reduce administrative overhead** so clinicians spend more time with patients and less time on paperwork.
4. **Provide a hackathon-ready MVP** that demonstrates end-to-end value within a constrained timeline.

#### Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Appointment booking time | < 60 seconds from search to confirmation | In-app timing |
| Prescription generation time | < 90 seconds per prescription | In-app timing |
| Daily active users (pilot) | ≥ 10 users in a single clinic | Analytics |
| Patient record retrieval | < 3 seconds (search to display) | Performance monitoring |
| User satisfaction (pilot) | ≥ 4.0 / 5.0 average rating | Post-pilot survey |
| System uptime | ≥ 99% during pilot period | Infrastructure monitoring |

### 1.4 Scope Boundaries

#### In Scope (MVP)

```
✅ User authentication & role-based authorization (Guest, Patient, Receptionist, Doctor, Admin)
✅ Patient registration and profile management
✅ Appointment scheduling with conflict detection
✅ Examination/visit recording (vitals, diagnosis, notes)
✅ Prescription creation and printing
✅ Invoice generation and payment recording
✅ Role-specific dashboards with summary statistics
✅ Notification system (in-app appointment reminders)
✅ Full Arabic (RTL) and English (LTR) localization
✅ Responsive web design (desktop-first, mobile-friendly)
✅ Audit logging for sensitive operations
```

#### Post-MVP (Phase 2+)

```
📋 SMS/WhatsApp appointment reminders
📋 Lab results and diagnostic imaging integration
📋 Inventory/pharmacy stock management
📋 Multi-clinic/branch management
📋 Patient mobile app (native)
📋 Telemedicine / video consultation
📋 Insurance claim processing
📋 Advanced analytics and reporting (BI dashboards)
📋 Integration with government health information exchanges
```

### 1.5 Explicit Out-of-Scope Items

The following are **explicitly excluded** from all project phases to prevent scope creep:

| Item | Rationale |
|---|---|
| **Electronic Health Record (EHR) certification** (e.g., ONC, NABIDH) | Requires extensive compliance work beyond project scope. |
| **HL7/FHIR interoperability** | No external system integration planned for MVP. |
| **Native mobile applications** (iOS/Android) | Web-responsive approach covers mobile access; native apps are a separate product. |
| **AI-powered diagnosis or clinical decision support** | Regulatory and liability concerns; not appropriate for an MVP. |
| **Medical device integration** (lab machines, imaging equipment) | Requires hardware partnerships and device-specific protocols. |
| **Insurance billing / claims adjudication** | Complex, jurisdiction-specific logic outside MVP scope. |
| **Multi-tenant SaaS architecture** | MVP targets single-clinic deployment; multi-tenancy is a future business model decision. |
| **HIPAA / GDPR full compliance audit** | Best practices will be followed, but formal compliance certification is out of scope. |
| **Offline / PWA mode** | Requires significant additional architecture; stable internet is assumed. |

---

## 2. Requirements Specification

### 2.1 Functional Requirements

#### FR-01 · Authentication & Authorization

| ID | Requirement | Priority |
|---|---|---|
| FR-01.01 | The system shall provide a **registration page** for new users (Patients and clinic staff via admin invite). | Must Have |
| FR-01.02 | The system shall authenticate users via **email/username and password** login. | Must Have |
| FR-01.03 | The system shall issue a **JWT access token** (short-lived) and a **refresh token** (long-lived) upon successful authentication. | Must Have |
| FR-01.04 | The system shall implement **Role-Based Access Control (RBAC)** with the following roles: Guest, Patient, Receptionist, Doctor, Clinic Administrator. | Must Have |
| FR-01.05 | The system shall enforce route-level and API-level authorization based on the user's assigned role. | Must Have |
| FR-01.06 | The system shall provide a **"Forgot Password"** flow that sends a time-limited reset link to the user's registered email. | Should Have |
| FR-01.07 | The system shall allow Clinic Administrators to **invite new staff** (Receptionist, Doctor) by email, assigning them a role upon registration. | Should Have |
| FR-01.08 | The system shall **lock accounts** after 5 consecutive failed login attempts for 15 minutes. | Should Have |
| FR-01.09 | The system shall allow users to **log out**, invalidating the current session/token. | Must Have |
| FR-01.10 | The system shall support **session persistence** so users remain logged in across browser refreshes (via refresh token). | Must Have |

#### FR-02 · Patient Management

| ID | Requirement | Priority |
|---|---|---|
| FR-02.01 | Receptionists and Doctors shall be able to **create a new patient record** with: full name, date of birth, gender, phone number, email (optional), national ID (optional), address, and emergency contact. | Must Have |
| FR-02.02 | The system shall **auto-generate a unique patient ID** (e.g., `PAT-20260001`) upon record creation. | Must Have |
| FR-02.03 | Users with appropriate roles shall be able to **search patients** by name, phone number, patient ID, or national ID. | Must Have |
| FR-02.04 | The system shall display a **patient profile page** consolidating demographics, medical history, appointments, prescriptions, and billing. | Must Have |
| FR-02.05 | Authorized users shall be able to **edit patient demographics** (address, phone, emergency contact). | Must Have |
| FR-02.06 | The system shall support **soft-deletion** of patient records (mark inactive) rather than permanent deletion. | Must Have |
| FR-02.07 | The patient profile shall include a **medical history section** showing chronic conditions, allergies, blood type, and past surgeries (free-text + structured fields). | Should Have |
| FR-02.08 | The system shall display a **timeline view** of all patient visits, sorted newest-first. | Should Have |
| FR-02.09 | Patients (if self-service enabled) shall be able to view their **own profile and appointment history**. | Nice to Have |

#### FR-03 · Appointments

| ID | Requirement | Priority |
|---|---|---|
| FR-03.01 | Receptionists shall be able to **create a new appointment** by selecting a patient, doctor, date, and time slot. | Must Have |
| FR-03.02 | The system shall display a **calendar view** (daily / weekly) of appointments per doctor. | Must Have |
| FR-03.03 | The system shall perform **conflict detection** — preventing double-booking of the same doctor at the same time slot. | Must Have |
| FR-03.04 | Receptionists shall be able to **reschedule** an existing appointment to a new date/time. | Must Have |
| FR-03.05 | Receptionists shall be able to **cancel** an appointment with an optional cancellation reason. | Must Have |
| FR-03.06 | Each appointment shall have a **status**: Scheduled, Confirmed, In Progress, Completed, Cancelled, No-Show. | Must Have |
| FR-03.07 | Doctors shall be able to define their **available time slots** (working hours per day of week). | Should Have |
| FR-03.08 | The system shall support **walk-in appointments** (immediate booking with "Walk-In" flag). | Should Have |
| FR-03.09 | The calendar view shall support **color-coded statuses** for quick visual scanning. | Should Have |
| FR-03.10 | Patients (if self-service enabled) shall be able to **request an appointment online** (subject to receptionist confirmation). | Nice to Have |
| FR-03.11 | The system shall display **estimated wait time** for patients with scheduled appointments. | Nice to Have |

#### FR-04 · Examinations / Visits

| ID | Requirement | Priority |
|---|---|---|
| FR-04.01 | Doctors shall be able to **start an examination** from a scheduled appointment, linking the visit to the patient and appointment records. | Must Have |
| FR-04.02 | The examination form shall capture: **vitals** (blood pressure, heart rate, temperature, weight, height), **chief complaint**, **diagnosis** (free-text + ICD code optional), and **clinical notes**. | Must Have |
| FR-04.03 | Doctors shall be able to **save a visit as draft** and complete it later within the same day. | Should Have |
| FR-04.04 | The system shall automatically update the appointment status to **"Completed"** when the examination is finalized. | Must Have |
| FR-04.05 | Each finalized examination shall be **immutable** — edits create a new amendment record with a timestamp and reason. | Should Have |
| FR-04.06 | Doctors shall be able to **view previous visit records** for the same patient directly from the examination screen. | Must Have |
| FR-04.07 | The examination record shall support **file attachments** (e.g., photos, scanned documents) up to 5 MB each. | Nice to Have |

#### FR-05 · Prescriptions

| ID | Requirement | Priority |
|---|---|---|
| FR-05.01 | Doctors shall be able to **create a prescription** linked to a specific examination/visit. | Must Have |
| FR-05.02 | Each prescription shall contain one or more **medication entries** with: medication name, dosage, frequency, route of administration, duration, and special instructions. | Must Have |
| FR-05.03 | The system shall provide a **searchable medication database** (pre-populated common medications) with autocomplete. | Should Have |
| FR-05.04 | Doctors shall be able to **print a prescription** in a formatted, clinic-branded layout (supporting both Arabic and English). | Must Have |
| FR-05.05 | The system shall maintain a **prescription history** per patient, accessible from the patient profile. | Must Have |
| FR-05.06 | Doctors shall be able to **duplicate a previous prescription** as a starting template for repeat medications. | Should Have |
| FR-05.07 | The system shall flag **basic drug-allergy interactions** if patient allergies are recorded. | Nice to Have |

#### FR-06 · Billing & Invoicing

| ID | Requirement | Priority |
|---|---|---|
| FR-06.01 | The system shall **auto-generate an invoice** upon visit completion, itemizing consultation fees and any additional services. | Must Have |
| FR-06.02 | Receptionists shall be able to **manually create an invoice** for services not tied to a visit. | Should Have |
| FR-06.03 | Each invoice shall have a **unique invoice number**, date, patient details, line items (description, quantity, unit price), subtotal, tax (optional), discount (optional), and total. | Must Have |
| FR-06.04 | The system shall record **payments** against invoices with: amount, payment method (Cash, Card, Bank Transfer), and date. | Must Have |
| FR-06.05 | Invoices shall track a **payment status**: Unpaid, Partially Paid, Paid, Overdue, Cancelled/Voided. | Must Have |
| FR-06.06 | Receptionists shall be able to **print or download a receipt** (PDF) for completed payments. | Must Have |
| FR-06.07 | The system shall support **partial payments** and track remaining balances. | Should Have |
| FR-06.08 | Clinic Administrators shall be able to view **revenue reports** filtered by date range, doctor, and payment method. | Should Have |
| FR-06.09 | Receptionists shall be able to apply **discount codes or manual discounts** to invoices (with admin-configured limits). | Nice to Have |

#### FR-07 · Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-07.01 | **Receptionist Dashboard** shall display: today's appointment count, upcoming appointments list, patients checked-in, and pending invoices. | Must Have |
| FR-07.02 | **Doctor Dashboard** shall display: today's patient queue, completed visits count, and recent examination summaries. | Must Have |
| FR-07.03 | **Admin Dashboard** shall display: total patients, total revenue (current month), appointment statistics (completed vs. cancelled vs. no-show), and active staff count. | Must Have |
| FR-07.04 | The Admin Dashboard shall include **charts**: revenue trend (line chart), appointment volume by day (bar chart), and patient demographics (pie chart). | Should Have |
| FR-07.05 | Dashboards shall display **recent activity feed** showing the last 10–20 actions performed in the clinic. | Should Have |
| FR-07.06 | Dashboard data shall **auto-refresh** at a configurable interval (default: every 60 seconds). | Nice to Have |

#### FR-08 · Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-08.01 | The system shall send **in-app notifications** to Receptionists when a new appointment is requested (if patient self-service is enabled). | Should Have |
| FR-08.02 | The system shall send **in-app notifications** to Doctors when their next patient is checked in. | Must Have |
| FR-08.03 | The system shall display a **notification bell icon** with unread count in the top navigation bar. | Must Have |
| FR-08.04 | Users shall be able to **mark notifications as read** or **dismiss** them. | Must Have |
| FR-08.05 | The system shall generate **appointment reminder notifications** to patients 24 hours and 1 hour before their appointment (in-app). | Should Have |
| FR-08.06 | Clinic Administrators shall be able to **broadcast announcements** to all staff (e.g., schedule changes, holidays). | Nice to Have |

---

### 2.2 Non-Functional Requirements

#### NFR-01 · Security

| ID | Requirement | Details |
|---|---|---|
| NFR-01.01 | **HTTPS Enforcement** | All traffic must be served over TLS 1.2+. HTTP requests shall be redirected to HTTPS. |
| NFR-01.02 | **JWT Token Security** | Access tokens shall expire in 15 minutes. Refresh tokens shall expire in 7 days. Tokens shall be stored in HTTP-only, secure, SameSite cookies. |
| NFR-01.03 | **Password Hashing** | Passwords shall be hashed using bcrypt with a minimum cost factor of 12. Plain-text passwords shall never be stored or logged. |
| NFR-01.04 | **Role-Based Access Control** | Every API endpoint shall validate the caller's role before processing. Unauthorized access shall return HTTP 403 with no data leakage. |
| NFR-01.05 | **Input Validation & Sanitization** | All user inputs shall be validated on both client and server side. SQL injection, XSS, and CSRF protections shall be implemented. |
| NFR-01.06 | **Rate Limiting** | Authentication endpoints shall be rate-limited to 10 requests/minute per IP to prevent brute-force attacks. |
| NFR-01.07 | **Sensitive Data Encryption** | Patient medical data shall be encrypted at rest (AES-256) in the database. |
| NFR-01.08 | **Dependency Security** | Third-party dependencies shall be scanned for known vulnerabilities during CI/CD. |

#### NFR-02 · Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-02.01 | **API Response Time** | 95th percentile response time shall be < 500ms for standard CRUD operations. |
| NFR-02.02 | **Page Load Time** | Initial page load (LCP) shall be < 2.5 seconds on a 4G connection. |
| NFR-02.03 | **Search Performance** | Patient search shall return results in < 1 second for databases up to 50,000 records. |
| NFR-02.04 | **Concurrent Users** | The system shall support at least **50 concurrent users** without degradation. |
| NFR-02.05 | **Database Query Optimization** | All frequently-used queries shall be indexed. N+1 query patterns shall be avoided. |

#### NFR-03 · Scalability

| ID | Requirement | Details |
|---|---|---|
| NFR-03.01 | **Horizontal Scalability** | The application layer shall be stateless, enabling horizontal scaling behind a load balancer. |
| NFR-03.02 | **Database Scalability** | The database schema shall support partitioning strategies for future growth (e.g., by clinic or date range). |
| NFR-03.03 | **Growth Target** | Architecture shall accommodate growth from 1 clinic (MVP) to 10 clinics without re-architecture. |

#### NFR-04 · Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-04.01 | **Uptime SLA** | ≥ 99% uptime during business hours (8 AM–10 PM local time). |
| NFR-04.02 | **Data Backup** | Automated daily database backups with 30-day retention. |
| NFR-04.03 | **Error Handling** | All API errors shall return structured JSON responses with error codes. Unhandled exceptions shall be caught by a global error handler. |
| NFR-04.04 | **Graceful Degradation** | If non-critical services (e.g., notifications) fail, core workflows (appointments, examinations) shall remain operational. |

#### NFR-05 · Maintainability

| ID | Requirement | Details |
|---|---|---|
| NFR-05.01 | **Modular Architecture** | Backend shall follow a modular/layered architecture (Controller → Service → Repository). Frontend shall use component-based architecture. |
| NFR-05.02 | **Code Documentation** | All public APIs shall have JSDoc/docstring comments. A README shall exist for each major module. |
| NFR-05.03 | **Coding Standards** | ESLint/Prettier (frontend) and language-appropriate linters (backend) shall be enforced in CI. |
| NFR-05.04 | **Test Coverage** | Critical business logic (billing calculations, conflict detection, RBAC) shall have unit tests with ≥ 70% coverage. |
| NFR-05.05 | **Version Control** | All code shall be managed in Git with a branching strategy (e.g., GitFlow or trunk-based). |

#### NFR-06 · Accessibility

| ID | Requirement | Details |
|---|---|---|
| NFR-06.01 | **WCAG 2.1 Level A** | The application shall meet WCAG 2.1 Level A criteria at minimum. |
| NFR-06.02 | **Keyboard Navigation** | All interactive elements shall be operable via keyboard. |
| NFR-06.03 | **Screen Reader Compatibility** | Semantic HTML and ARIA labels shall be used for all form elements, buttons, and navigation. |
| NFR-06.04 | **Color Contrast** | Text-to-background contrast ratio shall meet ≥ 4.5:1 (AA standard). |

#### NFR-07 · Localization (i18n / L10n)

| ID | Requirement | Details |
|---|---|---|
| NFR-07.01 | **Bilingual Support** | The UI shall fully support **Arabic (ar)** and **English (en)** with a language toggle accessible from any page. |
| NFR-07.02 | **RTL / LTR Layout** | The layout shall dynamically switch between RTL (Arabic) and LTR (English) based on the selected language, including mirrored icons and navigation. |
| NFR-07.03 | **Externalized Strings** | All user-facing text shall be stored in translation files (e.g., JSON locale files), never hardcoded. |
| NFR-07.04 | **Date & Number Formatting** | Dates, numbers, and currency shall be formatted according to the active locale (e.g., `dd/MM/yyyy` for Arabic, `MM/dd/yyyy` for English). |
| NFR-07.05 | **Arabic Typography** | The application shall use a legible Arabic-optimized font (e.g., Cairo, Tajawal, or IBM Plex Arabic) with appropriate line-height. |
| NFR-07.06 | **Bilingual Printing** | Printed outputs (prescriptions, invoices, receipts) shall render correctly in both Arabic and English. |

#### NFR-08 · Audit Logging

| ID | Requirement | Details |
|---|---|---|
| NFR-08.01 | **Audit Trail** | The system shall log all create, update, and delete operations on sensitive entities (patients, examinations, prescriptions, invoices). |
| NFR-08.02 | **Log Content** | Each audit log entry shall include: timestamp, user ID, user role, action type, entity type, entity ID, and a summary of changes (old value → new value for updates). |
| NFR-08.03 | **Immutability** | Audit logs shall be append-only; no user (including admins) shall be able to modify or delete audit records. |
| NFR-08.04 | **Admin Access** | Clinic Administrators shall be able to view and filter audit logs via a dedicated UI page. |
| NFR-08.05 | **Retention** | Audit logs shall be retained for a minimum of 1 year. |

---

## 3. User Stories

### User Story Format

> **As a** [role], **I want** [goal], **So that** [benefit].

### Priority Definitions

| Label | Meaning |
|---|---|
| **Must Have** | Essential for MVP / hackathon demo. The system cannot function without it. |
| **Should Have** | Important for a complete product but not a blocker for the first demo. |
| **Nice to Have** | Enhances UX or covers edge cases; implement if time permits. |

---

### 3.1 Guest Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-G01 | Guest | As a **Guest**, I want to **view the clinic's landing page** with services, location, and working hours, so that I can decide whether to visit or register. | Must Have |
| US-G02 | Guest | As a **Guest**, I want to **browse a list of doctors** with their specialties and availability, so that I can choose the right doctor before registering. | Should Have |
| US-G03 | Guest | As a **Guest**, I want to **register for a Patient account** using my email and phone number, so that I can book appointments online. | Must Have |
| US-G04 | Guest | As a **Guest**, I want to **switch the website language between Arabic and English**, so that I can browse in my preferred language. | Must Have |

### 3.2 Patient Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-P01 | Patient | As a **Patient**, I want to **log in to my account**, so that I can access my personal health dashboard. | Should Have |
| US-P02 | Patient | As a **Patient**, I want to **view my upcoming and past appointments**, so that I can keep track of my visits. | Should Have |
| US-P03 | Patient | As a **Patient**, I want to **request a new appointment** by selecting a doctor, date, and preferred time, so that I don't have to call the clinic. | Nice to Have |
| US-P04 | Patient | As a **Patient**, I want to **view my prescription history**, so that I can reference past medications and dosages. | Should Have |
| US-P05 | Patient | As a **Patient**, I want to **update my personal information** (phone, address, emergency contact), so that my records stay current. | Should Have |
| US-P06 | Patient | As a **Patient**, I want to **receive a notification 24 hours before my appointment**, so that I am reminded and can cancel if needed. | Nice to Have |

### 3.3 Receptionist Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-R01 | Receptionist | As a **Receptionist**, I want to **register a new patient** by entering their demographics, so that they have a record in the system before their first visit. | Must Have |
| US-R02 | Receptionist | As a **Receptionist**, I want to **search for an existing patient** by name, phone, or patient ID, so that I can quickly pull up their record. | Must Have |
| US-R03 | Receptionist | As a **Receptionist**, I want to **schedule a new appointment** by selecting a patient, doctor, date, and time slot, so that the visit is formally booked. | Must Have |
| US-R04 | Receptionist | As a **Receptionist**, I want to **see the daily appointment calendar for each doctor**, so that I can identify available slots at a glance. | Must Have |
| US-R05 | Receptionist | As a **Receptionist**, I want the system to **prevent me from double-booking a doctor**, so that scheduling conflicts are avoided. | Must Have |
| US-R06 | Receptionist | As a **Receptionist**, I want to **reschedule an appointment** to a different date or time, so that I can accommodate patient or doctor requests. | Must Have |
| US-R07 | Receptionist | As a **Receptionist**, I want to **cancel an appointment** and optionally record a reason, so that the slot is freed and the action is documented. | Must Have |
| US-R08 | Receptionist | As a **Receptionist**, I want to **check a patient in** upon arrival (change status to "In Progress"), so that the doctor knows who is ready. | Must Have |
| US-R09 | Receptionist | As a **Receptionist**, I want to **generate an invoice** after a visit is completed, so that the patient can be charged accurately. | Must Have |
| US-R10 | Receptionist | As a **Receptionist**, I want to **record a payment** (cash, card, or transfer) against an invoice, so that billing is tracked in real time. | Must Have |
| US-R11 | Receptionist | As a **Receptionist**, I want to **print a payment receipt** for the patient, so that they have proof of payment. | Must Have |
| US-R12 | Receptionist | As a **Receptionist**, I want to **see my dashboard** with today's appointment count, check-in status, and pending invoices, so that I can prioritize my tasks. | Must Have |

### 3.4 Doctor Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-D01 | Doctor | As a **Doctor**, I want to **view my daily patient queue** on my dashboard, so that I know who I'm seeing today and in what order. | Must Have |
| US-D02 | Doctor | As a **Doctor**, I want to **start an examination** from a scheduled appointment, so that the visit record is linked to the correct patient and appointment. | Must Have |
| US-D03 | Doctor | As a **Doctor**, I want to **record patient vitals** (BP, heart rate, temperature, weight, height) during an examination, so that objective measurements are documented. | Must Have |
| US-D04 | Doctor | As a **Doctor**, I want to **enter a diagnosis and clinical notes** during an examination, so that the patient's condition is formally documented. | Must Have |
| US-D05 | Doctor | As a **Doctor**, I want to **create a prescription** with one or more medications (name, dosage, frequency, duration), so that the patient receives clear medication instructions. | Must Have |
| US-D06 | Doctor | As a **Doctor**, I want to **print a prescription** in a clean, clinic-branded format (Arabic or English), so that the patient or pharmacy can read it clearly. | Must Have |
| US-D07 | Doctor | As a **Doctor**, I want to **view a patient's previous visits and prescriptions** from within the examination screen, so that I have full context for clinical decisions. | Must Have |
| US-D08 | Doctor | As a **Doctor**, I want to **finalize and sign off on an examination**, so that the record is locked and the appointment status is updated to "Completed". | Must Have |
| US-D09 | Doctor | As a **Doctor**, I want to **save an examination as a draft** and return to it later, so that I can handle interruptions without losing data. | Should Have |
| US-D10 | Doctor | As a **Doctor**, I want to **set my available working hours** for each day of the week, so that appointments are only booked during my availability. | Should Have |
| US-D11 | Doctor | As a **Doctor**, I want to **duplicate a previous prescription** as a template for a returning patient, so that I save time on repeat medications. | Should Have |
| US-D12 | Doctor | As a **Doctor**, I want to **receive a notification when a patient checks in**, so that I know my next patient is ready without checking the queue manually. | Should Have |

### 3.5 Clinic Administrator Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-A01 | Clinic Admin | As a **Clinic Administrator**, I want to **view an admin dashboard** with total patients, monthly revenue, and appointment statistics, so that I have a real-time overview of clinic performance. | Must Have |
| US-A02 | Clinic Admin | As a **Clinic Administrator**, I want to **manage staff accounts** (create, activate, deactivate Receptionists and Doctors), so that I control who has access to the system. | Must Have |
| US-A03 | Clinic Admin | As a **Clinic Administrator**, I want to **assign roles to staff members**, so that each user has the appropriate level of access. | Must Have |
| US-A04 | Clinic Admin | As a **Clinic Administrator**, I want to **configure clinic settings** (clinic name, logo, address, phone, working hours), so that printed documents and the landing page reflect accurate information. | Must Have |
| US-A05 | Clinic Admin | As a **Clinic Administrator**, I want to **view revenue reports** filtered by date range, doctor, and payment method, so that I can track financial performance. | Should Have |
| US-A06 | Clinic Admin | As a **Clinic Administrator**, I want to **view audit logs** of all sensitive actions (patient edits, deletions, prescription changes), so that I can investigate any irregularities. | Should Have |
| US-A07 | Clinic Admin | As a **Clinic Administrator**, I want to **manage the service catalog** (consultation types and their prices), so that invoices are generated with correct fees. | Should Have |
| US-A08 | Clinic Admin | As a **Clinic Administrator**, I want to **export patient and financial data** to CSV/Excel, so that I can perform offline analysis or share reports. | Nice to Have |
| US-A09 | Clinic Admin | As a **Clinic Administrator**, I want to **view appointment analytics** (no-show rate, peak hours, average wait time), so that I can optimize scheduling and staffing. | Nice to Have |
| US-A10 | Clinic Admin | As a **Clinic Administrator**, I want to **broadcast announcements** to all clinic staff, so that I can communicate schedule changes or policy updates efficiently. | Nice to Have |

### 3.6 System-Level Stories

| ID | Role | Story | Priority |
|---|---|---|---|
| US-S01 | System | As the **System**, I want to **enforce RBAC on every API request**, so that no user can access resources beyond their authorized role. | Must Have |
| US-S02 | System | As the **System**, I want to **log all sensitive data operations** to an immutable audit trail, so that a complete history of changes is preserved for accountability. | Must Have |
| US-S03 | System | As the **System**, I want to **automatically refresh expired JWT access tokens** using the refresh token, so that users are not forced to re-login during active sessions. | Must Have |
| US-S04 | System | As the **System**, I want to **send automated in-app notifications** for appointment reminders and status changes, so that relevant users are informed without manual intervention. | Should Have |

---

### User Story Summary

| Role | Count | Must Have | Should Have | Nice to Have |
|---|---|---|---|---|
| Guest | 4 | 3 | 1 | 0 |
| Patient | 6 | 0 | 4 | 2 |
| Receptionist | 12 | 12 | 0 | 0 |
| Doctor | 12 | 8 | 4 | 0 |
| Clinic Administrator | 10 | 4 | 3 | 3 |
| System | 4 | 3 | 1 | 0 |
| **Total** | **48** | **30** | **13** | **5** |

> **MVP Coverage:** The 30 Must Have stories form the complete hackathon MVP scope. They cover end-to-end clinic workflows from patient registration → appointment booking → examination → prescription → billing → dashboard visibility, ensuring a compelling demo.

---

*End of Part 1 — Vision, Requirements & User Stories*
