# Business Rules

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the official business rules governing the ST-Solutions Platform.

These rules must be followed by:

- Backend services
- Frontend applications
- AI Assistant
- Administrators
- Managers
- Members

Business rules always take precedence over implementation details.

---

# 1. Platform Roles

The platform supports five operational account types.

- ADMIN
- SUB_ADMIN
- MANAGER
- MEMBER
- CLIENT

Visitors do not own accounts.

---

# 2. Visitor Policy

Visitors may:

- Browse the website.
- Contact the company.
- Chat with the AI Assistant.
- Submit a member application.

Visitors cannot:

- Create platform accounts.
- Access dashboards.
- View internal information.
- Upload confidential project files.

---

# 3. Account Creation Policy

The platform does not provide public registration.

Accounts are created only by authorized staff.

Only:

- Admin
- Sub Admin

may create system accounts.

Managers and Members cannot create accounts.

---

# 4. Authentication Policy

Admin

Authentication Method

Email + Password

---

Sub Admin

Authentication Method

Email + Password

---

Manager

Authentication Method

Client ID + Password

---

Member

Authentication Method

Client ID + Password

---

Client

Authentication Method

Client ID + Password

---

Public email-based registration is not supported.

---

# 5. Recruitment Rules

Every member begins as an applicant.

Workflow

Application

↓

Review

↓

Verification

↓

Approval

↓

Member Profile

↓

Account Creation

Rejected applications never receive platform accounts.

---

# 6. Organization Rules

Members are trusted partners rather than traditional employees.

Each member may report to one manager.

Managers supervise multiple members.

Ranks determine organizational responsibilities.

Rank history is permanently preserved.

---

# 7. Client Acquisition Rules

Every client is permanently associated with the member who acquired them.

Client ownership history cannot be reassigned without administrative approval.

Ownership records remain preserved even if the member leaves the organization.

---

# 8. Client Lifecycle

Visitor

↓

Contact Request

↓

Discussion

↓

Lead

↓

Confirmed Client

↓

Client Account

↓

Project

↓

Payment

↓

Completed

---

# 9. Project Rules

Every project belongs to exactly one client.

Projects may have:

- one assigned manager;

- one assigned member.

Projects move through predefined lifecycle stages.

Progress updates are recorded separately.

Project history is immutable.

---

# 10. Payment Rules

Payments belong to clients.

Payments may optionally reference projects.

Only authorized staff may approve payments.

Financial history must never be deleted.

---

# 11. AI Assistant Rules

The AI Assistant represents ST-Solutions.

The AI:

- explains services;

- recommends solutions;

- answers company-related questions;

- detects visitor language;

- recommends contacting ST-Solutions;

- escalates complex requests to humans.

The AI never promises unavailable services.

The AI never invents pricing.

The AI must remain professional.

---

# 12. Communication Rules

Every important outgoing communication should be logged.

Supported communication channels include:

- Email

- WhatsApp

- Internal Notifications

Communication history should remain available for auditing.

---

# 13. Notification Rules

Notifications are user-specific.

Users may configure notification preferences.

Archived notifications remain accessible for historical purposes.

---

# 14. Analytics Rules

Analytics records are historical snapshots.

Analytics records must not be edited after creation.

Dashboard metrics may be recalculated.

Raw analytics remain immutable.

---

# 15. Security Rules

Passwords are stored only as hashes.

Refresh tokens are stored only as hashes.

API keys are stored only as hashes.

Webhook secrets are stored only as hashes.

Sensitive credentials are never stored in plaintext.

---

# 16. Audit Rules

Administrative actions must be recorded.

Audit history is permanent.

Audit records must not be deleted during normal platform operation.

---

# 17. Feature Management

Platform functionality is controlled through Feature Flags.

Major functionality may be enabled or disabled without redeployment.

Maintenance mode temporarily disables public functionality while preserving internal administration.

---

# 18. AI Knowledge Base

AI responses originate from approved knowledge.

Knowledge is maintained by administrators.

Training notes improve future responses.

Visitor feedback contributes to knowledge quality improvements.

---

# 19. Future Expansion

The platform architecture is designed to support future modules including:

- CRM

- ERP

- Invoicing

- Business Automation

- AI Automation

- Multi-language Expansion

Future modules must integrate without breaking the existing database architecture.

---

# 20. Change Policy

Database Schema Version 1.0 is frozen.

Business rules may evolve over time.

Structural database changes require:

- architecture review;

- business justification;

- documentation updates;

- implementation approval.

---

# Approval

Business Review

Completed

Architecture Review

Completed

Database Review

Completed

Status

Approved

Database Version

1.0 (Frozen)

---

End of Document