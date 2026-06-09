# Feature

Appointment Scheduling

## Problem

Manual scheduling causes double-bookings, unclear calendars, and long patient wait times. Clinics need a reliable scheduling system that coordinates patients, doctors, and statuses in one place.

## Business Value

Appointments are the operational backbone of the clinic. Strong scheduling improves utilization, reduces errors, and powers the downstream clinical workflow.

## Requirements

- Create appointments by selecting patient, doctor, date, and time slot.
- Show daily and weekly calendar views by doctor.
- Prevent double-booking for the same doctor and time slot.
- Support rescheduling and cancellation with reasons.
- Track statuses: Scheduled, Confirmed, In Progress, Completed, Cancelled, No-Show.
- Support walk-in appointments.
- Support doctor-defined available slots.
- Provide color-coded status visualization.
- Support patient online requests if self-service is enabled.
- Show estimated wait time as a later enhancement.

## User Stories

- As a receptionist, I want to book and reschedule appointments quickly so that the front desk stays efficient.
- As a doctor, I want to see my daily calendar so that I can manage my queue.
- As a patient, I want to request or view appointments so that I can coordinate care.

## Acceptance Criteria

- Appointment creation rejects time conflicts for the same doctor.
- Calendar views load appointments by date range and doctor.
- Staff can reschedule, cancel, and update statuses with auditability.
- Walk-in appointments can be flagged and handled immediately.
- Appointment state changes support downstream visit and notification workflows.

## Database Impact

- Uses `appointments`, linked to `patients` and `doctors`.
- Requires indexes on doctor, patient, date/time, and status.

## API Impact

- Appointment CRUD endpoints.
- Calendar and available-slot endpoints.
- Status transition endpoints or update flows.

## UI Impact

- Appointment list and filters.
- Appointment booking/reschedule form.
- Calendar page with color-coded states.

## Dependencies

- Patient management.
- Doctor management and availability.
- Notifications for reminders and check-in events.

## Tasks

- Define appointment entity, statuses, and validation rules.
- Implement booking, rescheduling, cancellation, and calendar APIs.
- Add conflict detection logic and tests.
- Build calendar and scheduling UI flows.

## Status

Backend Complete, Frontend Pending
