# Feature

Doctor Management and Availability

## Problem

Appointments and clinical workflows depend on a valid doctor roster and reliable availability data. Without structured doctor setup, scheduling conflicts and staff administration become error-prone.

## Business Value

This feature enables the clinic to manage clinicians as operational resources, which is required for booking, calendar views, reporting, and staffing oversight.

## Requirements

- Allow clinic administrators to create, edit, activate, and deactivate doctor records.
- Link doctor profiles to user accounts and roles.
- Store specialization, license, and schedule-related information as needed by the documented model.
- Allow doctors or admins to manage working hours and availability.
- Expose doctor lists for appointment scheduling and reporting filters.

## User Stories

- As an admin, I want to manage doctor records so that staffing data stays accurate.
- As a doctor, I want to define my working hours so that scheduling respects my availability.
- As a receptionist, I want to pick valid doctors from the booking flow so that appointments are assigned correctly.

## Acceptance Criteria

- Admins can create and update doctor records tied to users.
- Availability rules can be configured and retrieved.
- Inactive doctors are excluded from new bookings by default.
- Appointment scheduling can query doctor availability information.

## Database Impact

- Uses `doctors` and `users`.
- May rely on JSON-based `working_hours` per the documented conventions.

## API Impact

- Doctor CRUD endpoints.
- Availability and doctor listing endpoints.

## UI Impact

- Doctor management screens in admin area.
- Availability management UI.
- Doctor selector support in appointment forms and reports filters.

## Dependencies

- Authentication and RBAC.
- Admin module.
- Appointment scheduling feature.

## Tasks

- Define doctor model and user linkage.
- Implement doctor CRUD and availability endpoints.
- Build admin doctor management pages.
- Integrate doctor availability into appointment flows.

## Status

Completed
