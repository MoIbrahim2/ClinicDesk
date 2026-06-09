# Feature

Notifications

## Problem

Important workflow events can be missed without a unified notification system, especially in a busy clinic where staff coordinate appointments, check-ins, and time-sensitive actions.

## Business Value

Notifications improve responsiveness and reduce operational friction without requiring external messaging infrastructure in the MVP.

## Requirements

- Show an in-app notification bell with unread count.
- Allow users to view, mark as read, and dismiss notifications.
- Notify doctors when the next patient is checked in.
- Notify reception when a new patient appointment request is created in self-service scenarios.
- Generate patient reminder notifications 24 hours and 1 hour before appointments.
- Support admin broadcast announcements as a future enhancement.
- Keep core workflows operational if notifications fail.

## User Stories

- As a doctor, I want to be notified when my next patient is ready so that I can keep the queue moving.
- As a receptionist, I want to see new appointment requests so that I can confirm them promptly.
- As a user, I want unread counts and read states so that I can manage attention effectively.

## Acceptance Criteria

- Users can retrieve notification lists and unread counts.
- Notifications can be marked read or dismissed.
- Check-in events create doctor-facing notifications.
- Reminder generation does not block appointment functionality if it fails.

## Database Impact

- Uses `notifications`.
- Links notifications to `users` and relevant business entity references when needed.

## API Impact

- Notification list endpoint.
- Mark-read and dismiss/update endpoints.
- Background or scheduled reminder generation behavior.

## UI Impact

- Header bell icon and dropdown/panel.
- Notification center or list page if expanded.

## Dependencies

- Appointments and check-in flow.
- Authentication and per-user context.
- Optional email support for future expansion.

## Tasks

- Define notification model and lifecycle.
- Implement list and read-state APIs.
- Trigger notifications from appointment and check-in workflows.
- Build notification bell and list UI.

## Status

Implemented
