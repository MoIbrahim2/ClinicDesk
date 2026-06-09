# Feature

Visits and Examinations

## Problem

Clinicians need a structured digital examination record to replace handwritten notes, preserve patient history, and connect care delivery to prescriptions and billing.

## Business Value

Visit records are the clinical core of the system. They improve continuity of care, support safer documentation, and drive prescriptions, invoicing, and historical review.

## Requirements

- Start an examination from a scheduled appointment.
- Capture vitals, chief complaint, diagnosis, and clinical notes.
- Allow same-day draft saving before finalization.
- Automatically mark appointments completed when visits are finalized.
- Preserve immutability of finalized records through amendment-based changes.
- Show previous visit records from the examination workflow.
- Support optional file attachments up to the documented size limit.

## User Stories

- As a doctor, I want to document a visit during consultation so that the patient record stays accurate.
- As a doctor, I want to review prior visits while examining the patient so that I can make informed decisions.
- As clinic staff, I want visit completion to update appointment state automatically so that downstream workflows stay synchronized.

## Acceptance Criteria

- Doctors can create and finalize visits linked to appointments and patients.
- The visit form captures all required clinical fields.
- Finalizing a visit updates the related appointment state.
- Drafts can be resumed within the same day when enabled.
- Historical visit records are visible from the visit screen.

## Database Impact

- Uses `visits` and `diagnoses`.
- Links to `appointments`, `patients`, and `doctors`.
- May use JSON for `vital_signs` per the documented conventions.

## API Impact

- Visit CRUD endpoints.
- Diagnosis endpoints tied to visit records.
- Optional attachment upload endpoints.

## UI Impact

- Visit list and detail screens.
- Examination form with vitals and diagnosis sections.
- Previous-visit sidebar or inline history view.

## Dependencies

- Appointment scheduling.
- Patient management.
- Authentication with doctor-role permissions.

## Tasks

- Define visit and diagnosis models.
- Implement visit workflow and appointment linkage.
- Build examination UI and history access.
- Add validation and tests for status transitions.

## Status

In Progress (Backend Completed, Frontend Pending)
