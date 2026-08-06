# Backend Module Guidelines

Document Version: 1.0

Project: ST-Solutions Platform

Backend Version: 1.0

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the standard development rules for backend modules inside the ST-Solutions Platform.

The goal is to maintain:

- Consistent architecture.
- Clean code organization.
- Easy maintenance.
- Independent feature development.
- Scalable backend growth.

---

# Module Architecture Principle

Every business feature must exist as an independent module.

Example:

```
src/modules/

├── auth/
├── users/
├── clients/
├── projects/
├── payments/
└── ai/
```

Each module owns:

- Routes.
- Controllers.
- Services.
- Database access.
- Validation.
- Types.

---

# Standard Module Structure

Every module should follow:

```
module-name/

├── module.controller.ts

├── module.service.ts

├── module.repository.ts

├── module.routes.ts

├── module.validation.ts

├── module.types.ts

└── index.ts
```

---

# Controller Layer Guidelines

File:

```
module.controller.ts
```

Responsibility:

Controllers handle HTTP communication only.

Allowed:

- Receive request.
- Read parameters.
- Call service.
- Return response.

Not Allowed:

- Database queries.
- Business rules.
- Complex calculations.

---

Example:

```
Request

↓

Controller

↓

Service

↓

Response
```

---

# Controller Rules

Controllers must:

- Be thin.
- Avoid duplicate logic.
- Use standard responses.
- Handle HTTP status codes.

Controllers should not:

- Import Prisma directly.
- Access database models.
- Contain business workflows.

---

# Service Layer Guidelines

File:

```
module.service.ts
```

Responsibility:

Service layer contains business logic.

Examples:

- User registration workflow.
- Project approval process.
- Payment verification.
- AI recommendation logic.

---

# Service Responsibilities

Services handle:

- Business rules.
- Data processing.
- Workflow execution.
- Multiple repository calls.

---

# Repository Layer Guidelines

File:

```
module.repository.ts
```

Responsibility:

Repository handles database communication.

Allowed:

- Prisma queries.
- Database transactions.
- Data fetching.

---

Repository should provide:

- create()
- findOne()
- findMany()
- update()
- delete()

---

# Repository Rules

Repositories must:

- Hide Prisma implementation.
- Return clean data.
- Handle database operations only.

Controllers and services should not directly write Prisma queries.

---

# Route Layer Guidelines

File:

```
module.routes.ts
```

Responsibilities:

- Define API endpoints.
- Attach middleware.
- Connect controllers.

---

Example:

```
GET /users

POST /users

PATCH /users/:id
```

---

# Validation Layer Guidelines

File:

```
module.validation.ts
```

Technology:

Zod

Purpose:

Validate incoming data.

Examples:

- Request body.
- Query parameters.
- URL parameters.

---

Validation Flow:

Request

↓

Zod Validation

↓

Controller

↓

Service

---

# Types Layer Guidelines

File:

```
module.types.ts
```

Contains:

- Interfaces.
- DTO definitions.
- Module-specific types.

---

Rules:

Types should be reusable.

Avoid:

- Duplicate interfaces.
- Any type usage.

---

# Index File Guidelines

File:

```
index.ts
```

Purpose:

Provide clean exports.

Example:

```ts
export * from "./module.controller";
export * from "./module.service";
export * from "./module.routes";
```

---

# Module Communication Rules

Modules should communicate through services.

Correct:

```
Project Service

↓

Client Service

```

Incorrect:

```
Project Repository

↓

Client Repository
```

---

# Shared Logic Rules

Reusable logic belongs in:

```
src/shared/
```

Examples:

- Date utilities.
- Response handlers.
- Common errors.
- Security helpers.

---

# Database Access Rules

Database access flow:

```
Controller

↓

Service

↓

Repository

↓

Prisma

↓

Database
```

Forbidden:

```
Controller

↓

Prisma
```

---

# Error Handling Rules

All modules must use centralized errors.

Example:

```
throw new AppError(
"User not found",
404
)
```

Errors must be handled by:

```
Global Error Middleware
```

---

# Authentication Integration

Protected modules must use:

- Authentication middleware.
- Authorization middleware.

Example:

```
Route

↓

Auth Middleware

↓

Permission Check

↓

Controller
```

---

# Permission Guidelines

Sensitive actions require permission checks.

Examples:

Admin:

- Delete users.
- Manage settings.

Manager:

- Manage projects.

Member:

- Update assigned tasks.

Client:

- View own projects.

---

# Naming Standards

Files:

```
camel-case
```

Example:

```
user.service.ts
```

Classes:

```
PascalCase
```

Example:

```
UserService
```

Functions:

```
camelCase
```

Example:

```
createUser()
```

Database:

Follow Prisma naming standards.

---

# Testing Requirements

Every important module should include tests for:

- Service logic.
- Validation.
- Authorization.
- Database operations.

---

# Module Documentation

Each module should maintain:

- Purpose.
- API endpoints.
- Database models.
- Security rules.
- Dependencies.

---

# Production Quality Checklist

Before module completion:

☐ Controller separated

☐ Service implemented

☐ Repository created

☐ Validation added

☐ Types defined

☐ Permissions checked

☐ Errors handled

☐ Documentation updated

☐ Build verified

---

# Future Expansion

This architecture supports:

- Independent module scaling.
- Service extraction.
- Microservice migration.
- Background processing.
- AI agent integration.

---

# Approval

Backend Architecture Review:

Completed

Module Standards Review:

Completed


Status:

Approved


Backend Version:

1.0

---

End of Document