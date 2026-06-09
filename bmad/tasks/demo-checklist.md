# ClinicDesk Demo Checklist

Use this file before the final presentation to make sure the MVP is stable and easy to demonstrate.

## Demo Story

The demo should follow one simple story:

1. Login as receptionist
2. Register a new patient
3. Search and open the patient profile
4. Book an appointment
5. Login as doctor
6. Open the appointment and complete the visit
7. Create the prescription
8. Return to billing flow
9. Record payment
10. Show dashboard summary

## Pre-Demo Setup

| Check | Status |
|---|---|
| Frontend runs locally without errors | todo |
| Backend runs locally without errors | todo |
| Database is up and seeded | todo |
| Sample users exist for admin, receptionist, and doctor | todo |
| Sample doctors and services exist | todo |
| Arabic and English labels are available for demo pages | todo |

## Happy-Path Verification

| Check | Status |
|---|---|
| Receptionist can log in | todo |
| Doctor can log in | todo |
| Admin can log in | todo |
| Patient registration succeeds | todo |
| Patient appears in patient search results | todo |
| Appointment booking succeeds | todo |
| Double booking is blocked with a clear message | todo |
| Doctor can open visit form from appointment | todo |
| Doctor can save visit details and diagnosis | todo |
| Prescription is created and previewable | todo |
| Invoice is available after visit completion | todo |
| Payment can be recorded successfully | todo |
| Dashboard shows updated data after the flow | todo |

## UI Readiness

| Check | Status |
|---|---|
| Login page matches intended layout closely enough for demo | todo |
| Dashboard layout is clean and readable | todo |
| Patient list and detail pages are readable | todo |
| Appointment calendar or list is understandable in a live demo | todo |
| Visit form is usable without confusing fields | todo |
| Invoice and payment pages are readable | todo |
| No obviously broken styling on core pages | todo |

## Language And Access Checks

| Check | Status |
|---|---|
| Arabic mode switches direction correctly | todo |
| English mode switches back correctly | todo |
| Receptionist cannot access doctor-only screens unless intended | todo |
| Doctor cannot access admin-only screens unless intended | todo |
| Admin dashboard is accessible to admin account | todo |

## Demo Safety Checks

| Check | Status |
|---|---|
| Browser tabs needed for demo are ready | todo |
| Credentials are easy to access for presenters | todo |
| Seed data names are realistic and easy to explain | todo |
| Slow or risky screens have fallback explanation ready | todo |
| One backup demo path exists if a feature fails | todo |

## Presenter Notes

- Keep the flow short and clinical.
- Do not open unfinished pages during the demo.
- Prefer one strong end-to-end scenario over many shallow features.
- If charts or notifications are incomplete, present them only if they are stable.

## Final Go/No-Go Rule

The product is demo-ready when:

- the end-to-end clinic workflow works without manual database edits
- the UI is stable on the main story
- the team knows exactly which screens to show and in what order
