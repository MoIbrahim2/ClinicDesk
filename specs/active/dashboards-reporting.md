# Feature

Dashboards and Reporting

## Problem

Clinic managers and staff lack real-time visibility into operations, productivity, and revenue when data is spread across manual tools or siloed screens.

## Business Value

Dashboards and reports convert raw operational data into decision-making insight, which helps clinic owners manage performance and helps daily users stay focused on immediate work.

## Requirements

- Provide role-specific dashboards for receptionists, doctors, and administrators.
- Show today's appointments, queue information, pending invoices, visit counts, and operational summaries.
- Show admin KPIs such as total patients, monthly revenue, appointment outcomes, and active staff count.
- Support charts for revenue trends, appointment volume, and patient demographics.
- Show recent activity feed.
- Support auto-refresh at a configurable interval.
- Provide revenue and financial reports filtered by date, doctor, and payment method.
- Provide patient visit reporting and operational analytics where documented.

## User Stories

- As a receptionist, I want to see today's operational load so that I can manage the front desk efficiently.
- As a doctor, I want to see my queue and completed visits so that I can track my day.
- As an admin, I want financial and operational reports so that I can make data-driven decisions.

## Acceptance Criteria

- Each role sees only the dashboard relevant to that role.
- KPIs and lists reflect live backend data.
- Admin charts and reports filter correctly by supported dimensions.
- Recent activity reflects recent system actions.

## Database Impact

- Aggregates data from `appointments`, `visits`, `patients`, `invoices`, `payments`, `users`, and `audit_logs`.
- May leverage pre-optimized indexes and reporting queries.

## API Impact

- Dashboard summary endpoint.
- Revenue and appointment statistics endpoints.
- Report export or data retrieval endpoints where planned.

## UI Impact

- Receptionist dashboard.
- Doctor dashboard.
- Admin dashboard with charts.
- Reports page with filters.

## Dependencies

- Appointments, visits, billing, users, and audit logging.
- Charting library and translation support.

## Tasks

- Define report query contracts and KPI calculations.
- Implement dashboard and reporting endpoints.
- Build role-specific dashboard pages and charts.
- Verify filters, empty states, and performance targets.

## Status

Completed
