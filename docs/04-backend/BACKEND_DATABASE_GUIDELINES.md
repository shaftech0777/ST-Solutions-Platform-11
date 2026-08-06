# Backend Database Guidelines

Document Version: 1.0

Project: ST-Solutions Platform

Backend Version: 1.0

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the database architecture standards and development guidelines used in the ST-Solutions Platform.

The objective is to maintain:

- Scalable database structure.
- Consistent data modeling.
- Secure database operations.
- High performance queries.
- Reliable migrations.
- Long-term maintainability.

---

# Database Technology

Primary Database:

```
PostgreSQL
```

ORM:

```
Prisma ORM
```

Database Client:

```
Prisma Client
```

---

# Database Architecture

The platform database follows a modular domain-based architecture.

Structure:

```
Database

├── Identity Domain

├── Authentication Domain

├── Membership Domain

├── Client Domain

├── Project Domain

├── Payment Domain

├── Communication Domain

├── AI Intelligence Domain

├── Analytics Domain

└── Platform Administration Domain
```

---

# Database Design Principles

The database follows:

- Normalization.
- Referential integrity.
- Clear ownership.
- Audit preservation.
- Performance optimization.
- Security-first design.

---

# Prisma Schema Standards

Schema location:

```
apps/api/prisma/schema.prisma
```

---

# Model Naming Rules

Models must use:

```
PascalCase
```

Examples:

Correct:

```
User

Project

ClientRequest

AuditLog
```

Incorrect:

```
users

project_table

client_request
```

---

# Field Naming Rules

Fields use:

```
camelCase
```

Examples:

Correct:

```
createdAt

userId

projectStatus
```

Incorrect:

```
created_at

User_ID
```

---

# Primary Key Standards

Every major entity should use UUID.

Example:

```prisma
id String @id @default(uuid())
```

Benefits:

- Distributed system support.
- Security improvement.
- Collision resistance.

---

# Timestamp Standards

Models should include:

```
createdAt

updatedAt
```

Example:

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# Soft Delete Strategy

Critical records should avoid permanent deletion.

Preferred approach:

```
status field
```

Example:

```
ACTIVE

INACTIVE

ARCHIVED
```

---

# Database Relations

Relations must define:

- Relationship type.
- Foreign key.
- Delete behavior.

---

# Delete Rules

## Cascade

Used for dependent records.

Example:

```
Project

↓

ProjectUpdate
```

Deleting project removes updates.

---

## SetNull

Used for optional references.

Example:

```
User

↓

AuditLog
```

User removal keeps history.

---

## Restrict

Used for important ownership records.

Example:

```
Payment Approval

↓

Admin User
```

History cannot be destroyed.

---

# Indexing Strategy

Indexes must exist on frequently searched fields.

Common indexed fields:

```
email

status

createdAt

userId

projectId

period

date
```

---

# Composite Indexes

Use composite indexes for common query combinations.

Example:

```prisma
@@index([status, createdAt])
```

---

# Unique Constraints

Unique constraints protect data integrity.

Examples:

```
email

username

featureKey

metricKey
```

---

# Enum Standards

Enums must represent fixed states.

Example:

```
ACTIVE

INACTIVE

PENDING

COMPLETED
```

Avoid:

- Dynamic values.
- User-created statuses.

---

# Migration Strategy

All database changes must use migrations.

Workflow:

```
Schema Change

↓

Prisma Migration

↓

Review

↓

Testing

↓

Production Deployment
```

---

# Migration Rules

Never:

- Modify production database manually.
- Delete migrations.
- Skip migration reviews.

---

# Database Transactions

Transactions must be used for multi-step operations.

Example:

User registration:

```
Create User

+

Create Profile

+

Create Session
```

All operations should succeed together.

---

# Query Optimization

Developers should:

- Avoid unnecessary queries.
- Use indexes.
- Select only required fields.
- Use pagination.

---

# Prisma Query Rules

Avoid:

```
SELECT *
```

Prefer:

```
select {}
```

Example:

```ts
prisma.user.findMany({
 select:{
  id:true,
  email:true
 }
})
```

---

# Data Security

Sensitive information requires protection.

Examples:

Protected:

```
passwordHash

tokenHash

keyHash

secretHash
```

Never store:

```
plain password

plain API keys

plain tokens
```

---

# Backup Strategy

Database backups must include:

- Full database backup.
- Backup history.
- Restore testing.

Backup records stored in:

```
BackupHistory
```

---

# Database Monitoring

Monitor:

- Query performance.
- Connection usage.
- Storage growth.
- Failed transactions.

---

# Development Database Rules

Development environment:

Allowed:

- Detailed query logs.
- Test data.
- Debug information.

Not allowed:

- Production credentials.

---

# Production Database Rules

Production requires:

- Secure credentials.
- Restricted access.
- Automated backups.
- Monitoring.
- Migration control.

---

# Database Testing

Required tests:

☐ Schema validation

☐ Migration testing

☐ Relation testing

☐ Constraint testing

☐ Transaction testing

---

# Current Database Architecture Status

Implemented Domains:

```
Identity

Authentication

RBAC

Recruitment

Clients

Projects

Payments

Members

Content Management

Communication

AI Intelligence

Analytics

Administration
```

---

# Database Schema Version

Current Version:

```
v1.0 FROZEN
```

Status:

```
Production Ready Architecture
```

---

# Future Database Improvements

Planned:

- Read replicas.
- Database partitioning.
- Advanced caching.
- Event sourcing.
- Data warehouse integration.
- AI analytics storage optimization.

---

# Approval

Database Architecture Review:

Completed

Database Guidelines:

Approved


Backend Version:

1.0

---

End of Document