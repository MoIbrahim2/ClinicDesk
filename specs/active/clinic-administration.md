# Feature

Clinic Administration

## Problem

Clinic owners need a controlled way to manage staff, services, clinic configuration, and governance data without depending on ad hoc technical intervention.

## Business Value

Administration features make the platform usable as a real clinic operating system rather than a narrow scheduling tool. They also support pricing, staffing, and audit oversight.

## Requirements

- Manage staff users and roles as an administrator.
- Manage doctors and their active state.
- Manage clinic services and pricing.
- Configure clinic settings including clinic identity and operational configuration.
- View audit logs for sensitive create, update, and delete operations.
- Support filtering of audit logs by user, entity, action type, and date range.

## User Stories

- As an admin, I want to manage staff accounts so that the correct people have access.
- As an admin, I want to maintain clinic services and pricing so that billing is accurate.
- As an admin, I want to review audit logs so that I can monitor accountability and changes.

## Acceptance Criteria

- Admins can create and manage staff and service records.
- Clinic settings can be retrieved and updated centrally.
- Audit logs are visible but immutable.
- Admin-only routes remain inaccessible to non-admin users.

## Database Impact

- Uses `users`, `roles`, `doctors`, `services`, `clinic_settings`, and `audit_logs`.
- Audit logs must preserve old/new values and actor context.

## API Impact

- Admin user-management endpoints.
- Service-management endpoints.
- Clinic settings endpoints.
- Audit log retrieval endpoints.

## UI Impact

- User management page.
- Service management page.
- Clinic settings page.
- Audit log page with filters.

## Dependencies

- Authentication and RBAC.
- Billing uses service pricing.
- Audit log generation from domain modules.

## Tasks

- Define admin, service, settings, and audit-log contracts.
- Implement admin management APIs and permissions.
- Build admin UI pages.
- Connect audit logging across sensitive workflows.

## Status

In Progress (Services, Staff, and Settings implemented; Audit Logging pending)
