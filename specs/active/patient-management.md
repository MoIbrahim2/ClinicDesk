# Feature

Patient Management

## Problem

Paper files and fragmented spreadsheets make patient records hard to search, update, and trust. Staff need a single digital patient record with searchable demographics and longitudinal history.

## Business Value

Patient management is the foundation for appointments, visits, prescriptions, billing, and reporting. It reduces administrative friction and improves continuity of care.

## Requirements

- Create patient records with demographics, contact details, and emergency contact.
- Auto-generate a unique patient ID.
- Search patients by name, phone, patient ID, or national ID.
- Display a consolidated patient profile with appointments, visits, prescriptions, and billing.
- Allow authorized edits to demographics.
- Support inactive/soft-delete behavior instead of destructive deletion.
- Support medical history fields such as allergies, chronic conditions, blood type, and surgeries.
- Provide a visit timeline view.
- Allow patients to view their own profile and appointment history when self-service is enabled.

## User Stories

- As a receptionist, I want to register a new patient quickly so that I can book care without paperwork.
- As a doctor, I want to search patients instantly so that I can retrieve records during consultation.
- As a patient, I want to review my own history so that I stay informed about my care.

## Acceptance Criteria

- Authorized staff can create and edit patient records with validation.
- New patient records receive a unique human-readable patient ID.
- Search returns matching records within the documented performance target.
- Patient detail screens show demographics, medical history, visits, prescriptions, appointments, and invoices.
- Inactive patients are hidden from default active flows but remain historically accessible.

## Database Impact

- Uses `patients`.
- Related to `users`, `appointments`, `visits`, `prescriptions`, `invoices`, `payments`, and `medical_reports`.
- Requires indexes for name, phone, patient code, and national ID search.

## API Impact

- Patient CRUD endpoints.
- Patient search and filter endpoints.
- Patient detail endpoint with aggregated history.

## UI Impact

- Patient list page with search and filters.
- Patient create/edit form.
- Patient detail page with tabs and timeline.

## Dependencies

- Authentication and RBAC.
- Shared table, form, and status components.
- Appointments, visits, prescriptions, and billing data for full profile views.

## Tasks

- Design patient entity and DTOs.
- Implement CRUD and search endpoints.
- Build patient list, forms, and detail pages.
- Add patient profile aggregation and timeline UI.

## Status

Draft
