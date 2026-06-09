# Feature

Prescriptions

## Problem

Handwritten prescriptions are slow, error-prone, and difficult to track. Doctors need a structured prescription workflow linked directly to the visit record.

## Business Value

Digital prescriptions improve readability, reduce friction for repeat care, and strengthen the clinic's end-to-end patient record.

## Requirements

- Create prescriptions linked to visits.
- Support one or more medication items per prescription.
- Capture medication name, dosage, frequency, route, duration, and instructions.
- Support a searchable medication list with autocomplete.
- Support bilingual, clinic-branded printable output.
- Show prescription history per patient.
- Allow duplication of prior prescriptions.
- Optionally flag basic drug-allergy interactions.

## User Stories

- As a doctor, I want to create a prescription from the visit record so that treatment is documented immediately.
- As a doctor, I want to print a clean prescription so that the patient and pharmacy can read it clearly.
- As a patient, I want my prescription history preserved so that future care is easier.

## Acceptance Criteria

- A doctor can create a prescription from an existing visit.
- Prescriptions include one or more medication items with required fields.
- Printable views render correctly in Arabic and English.
- Patient history surfaces prior prescriptions.
- Doctors can duplicate a prior prescription when the workflow is enabled.

## Database Impact

- Uses `prescriptions` and `prescription_items`.
- Links to `visits`, `patients`, and `doctors`.

## API Impact

- Prescription CRUD endpoints.
- Printable/export endpoint.
- Medication search endpoint or supporting catalog source.

## UI Impact

- Prescription form.
- Prescription list/history view.
- Print preview or printable layout.

## Dependencies

- Visits and examinations.
- Patient management.
- Localization and print styling support.

## Tasks

- Define prescription data model.
- Implement create, list, detail, and print endpoints.
- Build prescription form and history UI.
- Add duplication and medication search support.

## Status

In Progress (Backend Completed, Frontend Pending)
