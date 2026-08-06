# Database Naming Conventions

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the official naming conventions for the ST-Solutions Platform database.

Consistent naming improves readability, maintainability, onboarding, and long-term scalability.

All database objects must follow these conventions.

---

# General Principles

The database naming strategy follows these principles:

- Consistent
- Predictable
- Human-readable
- Business-oriented
- Technology-independent

Abbreviations should be avoided unless they are universally understood.

---

# Model Naming

Models represent business entities.

Rules

- Use PascalCase.
- Use singular nouns.
- Use descriptive names.
- Avoid abbreviations.
- Avoid technical implementation terms.

Correct Examples

- User
- Client
- Project
- Payment
- AIConversation
- MemberReward
- PlatformVersion

Incorrect Examples

- Users
- TblUser
- user_data
- ClientTable
- AIConv

---

# Field Naming

Fields represent properties of a model.

Rules

- Use camelCase.
- Begin with a lowercase letter.
- Use meaningful names.
- Avoid unnecessary prefixes.

Correct Examples

- firstName
- lastName
- companyName
- createdAt
- updatedAt
- paymentStatus
- accountType

Incorrect Examples

- First_Name
- first_name
- txtName
- fldStatus
- c_name

---

# Primary Keys

Every model uses:

id

Rules

- UUID
- Single primary key
- Named exactly `id`

Incorrect

- userId (as primary key)
- clientID
- pkId

---

# Foreign Keys

Foreign keys must follow:

relatedModelName + Id

Examples

- userId
- clientId
- memberId
- managerId
- projectId
- roleId
- permissionId
- categoryId

Avoid

- uid
- cid
- memberID
- project_fk

---

# Boolean Fields

Boolean fields should clearly express a true/false state.

Preferred prefixes

- is
- has
- can
- allow

Examples

- isActive
- isFeatured
- hasVerifiedEmail
- canLogin
- allowClientRequests

Avoid

- activeFlag
- statusFlag
- boolActive

---

# Date & Time Fields

Date fields should clearly describe the event they represent.

Examples

- createdAt
- updatedAt
- deletedAt
- approvedAt
- startedAt
- completedAt
- expiresAt
- releasedAt

Avoid

- date1
- dt
- timestampValue

---

# Enum Naming

Enum Types

Use PascalCase.

Examples

- UserStatus
- ProjectStatus
- AnalyticsPeriod
- PaymentStatus

Enum Values

Use uppercase with underscores.

Examples

- ACTIVE
- IN_PROGRESS
- CLIENT_REFERRAL
- MORE_INFORMATION_REQUIRED

Avoid

- Active
- inProgress
- clientReferral

---

# Relation Naming

Relation names should describe the business relationship.

Examples

- createdBy
- reviewedBy
- approvedBy
- manager
- member
- client
- owner

Collection Relations

Use plural names.

Examples

- projects
- payments
- notifications
- aiConversations
- memberRewards

---

# Junction Tables

Many-to-many relationships use descriptive names.

Examples

- RolePermission

Avoid

- Mapping1
- LinkTable
- UserRoleMap

---

# Index Naming

Prisma automatically manages most index names.

Where explicit names are required, use:

Model_Field_idx

Examples

- User_email_idx
- Project_status_idx
- Payment_createdAt_idx

---

# Unique Constraints

Unique constraints should reflect business uniqueness.

Examples

- email
- sessionId
- featureKey
- metricKey
- version

Avoid creating unnecessary unique constraints.

---

# File Naming

Documentation files

Use uppercase with underscores.

Examples

- DATABASE_SCHEMA.md
- BUSINESS_RULES.md
- INDEXING_STRATEGY.md
- ENUM_REFERENCE.md

Avoid

- databaseSchema.md
- DbRules.md
- businessrules.md

---

# Reserved Words

Avoid using SQL reserved words as model or field names.

Examples to avoid

- Order
- Group
- Select
- Table
- Column

Prefer descriptive business alternatives.

Examples

- ProjectOrder
- UserGroup
- DisplayOrder

---

# Consistency Rules

Every new database object must follow the existing naming style.

Do not introduce alternative naming patterns within the same project.

Consistency is preferred over personal preference.

---

# Future Changes

Any new model introduced after Database Schema Version 1.0 must comply with this document.

Naming convention changes require architecture review.

---

# Approval

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