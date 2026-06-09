# Feature

Authentication and Authorization

## Problem

Clinic staff and patients need secure, role-specific access to the platform. Manual or weak authentication would expose sensitive patient and billing data and make it impossible to enforce safe workflows.

## Business Value

This feature secures the entire system, enables role-specific experiences, and creates the trust boundary required for every clinical and financial workflow.

## Requirements

- Support user registration for patients and invited staff.
- Support login with email or username and password.
- Issue JWT access tokens and refresh tokens.
- Persist sessions across browser refreshes.
- Support logout and session invalidation.
- Enforce RBAC for Guest, Patient, Receptionist, Doctor, and Clinic Administrator.
- Support forgot-password flow with time-limited reset links.
- Support admin staff invitation by email with assigned role.
- Lock accounts after repeated failed login attempts.

## User Stories

- As a guest, I want to register an account so that I can access ClinicDesk services.
- As a user, I want to log in securely so that I can reach the parts of the system relevant to my role.
- As an admin, I want to invite staff with predefined roles so that onboarding is controlled.
- As a user, I want to stay signed in across refreshes so that daily work is uninterrupted.

## Acceptance Criteria

- Users can register, log in, refresh sessions, and log out successfully.
- Unauthorized users cannot access protected pages or APIs.
- Role-restricted APIs return `403` when accessed by insufficient roles.
- Failed login attempts trigger temporary account lockout after the documented threshold.
- Password reset links expire and can only be used once within the allowed window.

## Database Impact

- Uses `roles` and `users` tables.
- Stores hashed passwords, role assignments, active state, and optional invitation/reset metadata.
- May store role permissions JSON according to the documented architecture.

## API Impact

- Auth endpoints for register, login, logout, refresh, forgot password, and reset password.
- User profile endpoints for current authenticated user.
- Role guards applied across all protected modules.

## UI Impact

- Login page.
- Registration page.
- Forgot password and reset password pages.
- Protected route handling and role-aware navigation.

## Dependencies

- Roles seed data.
- Email configuration for password reset and staff invites.
- Global auth context and HTTP interceptor behavior.

## Tasks

- Define auth entities, DTOs, and guards.
- Implement login, registration, refresh, logout, and password reset flows.
- Configure cookie-based token handling.
- Add protected routing and role-aware menus.
- Add failed-attempt lockout and validation messaging.

## Status

Draft
