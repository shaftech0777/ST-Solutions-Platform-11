# Database API Mapping

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the relationship between database entities and application API modules.

It explains:

- Which API module manages which database models.
- Backend service ownership.
- Frontend feature dependencies.
- AI integration points.
- Data access boundaries.

---

# Architecture Overview

The ST-Solutions Platform follows this flow:

Frontend

↓

API Layer

↓

Service Layer

↓

Repository / Data Access Layer

↓

Prisma ORM

↓

PostgreSQL Database

---

# Identity API Module

Location:

```
apps/api/src/modules/auth
```

Database Models:

- User
- UserProfile
- Session
- Role
- Permission
- RolePermission
- AuditLog

Responsibilities:

- User registration.
- Login.
- Authentication.
- JWT management.
- Role verification.
- Permission checking.
- Session control.

Frontend Features:

- Login page.
- User dashboard.
- Account settings.
- Role-based navigation.

---

# User Management Module

Location:

```
apps/api/src/modules/users
```

Database Models:

- User
- UserProfile
- AuditLog

Responsibilities:

- User profiles.
- Account status management.
- User administration.

Used By:

- Admin dashboard.
- Member dashboard.
- Client portal.

---

# Role & Permission Module

Location:

```
apps/api/src/modules/roles
apps/api/src/modules/permissions
```

Database Models:

- Role
- Permission
- RolePermission

Responsibilities:

- RBAC system.
- Access control.
- Permission assignment.

Used By:

- Admin panel.
- Security middleware.

---

# Recruitment Module

Location:

```
apps/api/src/modules/applicants
```

Database Models:

- MemberApplication
- ApplicationQuestion
- ApplicationAnswer
- MemberVerification

Responsibilities:

- Application submission.
- Screening questions.
- Verification workflow.
- Application review.

Frontend Features:

- Member application form.
- Application tracking.

---

# Member Management Module

Location:

```
apps/api/src/modules/members
```

Database Models:

- Member
- MemberProfile
- Rank
- MemberRankHistory
- MemberReward

Responsibilities:

- Partner management.
- Rank system.
- Performance tracking.
- Reward handling.

Frontend Features:

- Member dashboard.
- Partner profile.
- Performance view.

---

# Client Management Module

Location:

```
apps/api/src/modules/clients
```

Database Models:

- Client
- ClientRequest
- ClientOwnership

Responsibilities:

- Lead management.
- Client onboarding.
- Client ownership tracking.

Frontend Features:

- Client portal.
- Contact forms.
- Business inquiries.

---

# Project Management Module

Location:

```
apps/api/src/modules/projects
```

Database Models:

- Project
- ProjectUpdate

Responsibilities:

- Project lifecycle.
- Assignment.
- Progress tracking.
- Client updates.

Frontend Features:

- Project dashboard.
- Project timeline.
- Progress tracking.

---

# Payment Module

Location:

```
apps/api/src/modules/payments
```

Database Models:

- Payment
- MemberReward
- RevenueAnalytics

Responsibilities:

- Payment tracking.
- Approval workflow.
- Revenue records.

Frontend Features:

- Client billing.
- Admin finance dashboard.

---

# Communication Module

Location:

```
apps/api/src/modules/notifications
```

Database Models:

- Notification
- NotificationPreference
- ContactMessage
- EmailTemplate
- WhatsAppTemplate
- CommunicationLog
- Announcement

Responsibilities:

- Notifications.
- Email automation.
- WhatsApp messaging.
- Communication history.

Frontend Features:

- Notification center.
- Contact management.

---

# AI Module

Location:

```
apps/api/src/modules/ai
```

Database Models:

- AIKnowledgeCategory
- AIKnowledge
- AIConversation
- AIConversationMessage
- AIIntent
- AIRecommendation
- AIQuickReply
- AIKnowledgeFeedback
- AITrainingNote
- SupportedLanguage

Responsibilities:

- AI assistant.
- Knowledge retrieval.
- Intent detection.
- Recommendations.
- Multilingual conversation.

Frontend Features:

- AI chat assistant.
- Visitor guidance.
- Business consultation.

---

# Settings Module

Location:

```
apps/api/src/modules/settings
```

Database Models:

- CompanyProfile
- WebsiteSettings
- SEOSettings
- SystemConfiguration
- FeatureFlag

Responsibilities:

- Platform configuration.
- Website controls.
- Feature management.

Frontend Features:

- Dynamic website content.
- Feature availability.

---

# Audit Module

Location:

```
apps/api/src/modules/audit
```

Database Models:

- AuditLog
- MaintenanceLog
- CommunicationLog

Responsibilities:

- Security tracking.
- Administrative history.
- Compliance records.

---

# Analytics Module

Location:

```
apps/api/src/modules/analytics
```

Database Models:

- VisitorSession
- WebsiteAnalytics
- AIAnalytics
- ClientAnalytics
- MemberAnalytics
- ManagerAnalytics
- RevenueAnalytics
- DashboardMetric

Responsibilities:

- Business intelligence.
- Performance tracking.
- Dashboard metrics.

Frontend Features:

- Admin analytics dashboard.
- Business reports.

---

# Platform Administration Module

Location:

```
apps/api/src/modules/settings
```

Database Models:

- BackupHistory
- ApiKey
- WebhookEndpoint
- WebhookLog
- PlatformVersion
- Changelog
- ScheduledTask
- MaintenanceWindow

Responsibilities:

- Platform operations.
- External integrations.
- Version tracking.
- System maintenance.

---

# Data Access Rules

API modules should follow:

Controller

↓

Service

↓

Repository

↓

Prisma

↓

Database

---

# Direct Database Access Policy

Controllers must never directly access Prisma.

Allowed:

Service Layer → Repository Layer → Prisma

Not Allowed:

Controller → Prisma

---

# Frontend Data Consumption

Frontend applications consume data through APIs.

Frontend must never:

- Access database directly.
- Store database credentials.
- Execute database queries.

---

# AI Data Access Policy

AI system can access:

Allowed:

- Public company information.
- Approved knowledge base.
- Service information.
- Portfolio information.

Restricted:

- Password data.
- Payment details.
- Private client information.
- Internal security settings.

---

# Future Expansion

New database models must have:

- Dedicated API ownership.
- Service layer implementation.
- Documentation update.
- Security review.

---

# Approval

Architecture Review

Completed

Backend Review

Completed

Database Review

Completed

Status

Approved

Database Version

1.0 (Frozen)

---

End of Document