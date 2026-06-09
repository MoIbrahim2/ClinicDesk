# Feature

Billing, Invoicing, and Payments

## Problem

Disconnected billing causes revenue leakage, unclear balances, and weak financial tracking. The clinic needs a reliable way to convert care activity into invoices and recorded payments.

## Business Value

Billing closes the loop between operations and revenue. It improves financial transparency, supports front-desk workflows, and gives administrators a trustworthy basis for reporting.

## Requirements

- Auto-generate invoices from completed visits.
- Allow manual invoice creation for non-visit services.
- Generate unique invoice numbers.
- Capture patient details, line items, subtotal, optional tax, optional discount, and total.
- Record payments with amount, method, and date.
- Track invoice statuses including unpaid, partially paid, paid, overdue, and voided/cancelled.
- Provide printable or downloadable receipts.
- Support partial payments and remaining balance tracking.
- Support revenue reports and filtered financial views.
- Optionally support discount codes and admin-limited manual discounts.

## User Stories

- As a receptionist, I want invoices generated and editable so that I can complete checkout efficiently.
- As a receptionist, I want to record payments and print receipts so that the patient leaves with proof of payment.
- As an admin, I want financial visibility so that I can monitor revenue and performance.

## Acceptance Criteria

- Completing a visit can generate an invoice with expected line items.
- Staff can create standalone invoices where allowed.
- Payments update invoice balance and payment status correctly.
- Receipts can be printed or exported.
- Partial payments retain the outstanding amount accurately.

## Database Impact

- Uses `services`, `invoices`, `invoice_items`, and `payments`.
- Links to `patients`, `visits`, and optionally `doctors`.
- Requires safe decimal handling for all monetary amounts.

## API Impact

- Invoice CRUD endpoints.
- Payment recording endpoints.
- Receipt/print endpoints.
- Revenue and financial summary queries.

## UI Impact

- Invoice list page with filters.
- Invoice detail and form screens.
- Payment form.
- Receipt and invoice print previews.

## Dependencies

- Visits and examinations.
- Clinic services administration.
- Reports/dashboard aggregation.

## Tasks

- Define invoice, invoice item, payment, and service models.
- Implement invoice generation and payment workflows.
- Build billing list, detail, and payment UI.
- Add calculations and tests for totals, balances, and statuses.

## Status

Completed
