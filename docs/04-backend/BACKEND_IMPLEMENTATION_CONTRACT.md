# Backend Implementation Contract

Document Version: 1.0  
Project: ST-Solutions Platform  
Backend Core Architecture: Phase 15.1  
Status: Approved & Binding  
Last Updated: 2026-08-06  

---

# 1. Purpose

This document serves as the official, mandatory **Backend Implementation Contract** for the ST-Solutions Platform. 

Every backend developer, AI coding agent, system architect, and automated code-generation workflow contributing to this codebase **MUST strictly adhere** to the patterns, structures, specifications, and rules set forth in this contract.

No backend file, module, controller, service, repository, middleware, route, or database query may be merged or deployed if it violates any clause of this specification. This contract ensures absolute architectural integrity, enterprise-grade security, deterministic error handling, linear request traceability, high maintainability, and seamless production readiness across the entire lifecycle of the ST-Solutions Platform.

---

# 2. Backend Philosophy

The ST-Solutions Platform backend is engineered on eight core foundational architectural principles:

### 2.1 Enterprise First
Code is written for large-scale enterprise durability. Every component must be resilient to high concurrency, defensive against malformed inputs, observable through structured logging, and structured for zero-downtime evolution.

### 2.2 Security First
Security is not an afterthought or secondary layer. Zero-trust architecture, strict input sanitization, non-negotiable authorization checks, hashed credentials, and strict data leakage controls are baked directly into the request processing loop.

### 2.3 Scalability First
The application tier must remain entirely **stateless**. Session tracking, temporary state, and cache states must be delegated to scalable external persistence layers (PostgreSQL, Redis) to allow horizontal container auto-scaling.

### 2.4 Clean Architecture
Dependencies flow inward. High-level business domain logic (Services) remains completely decoupled from delivery mechanisms (Express Controllers) and data storage mechanisms (Prisma ORM Repositories).

### 2.5 SOLID Principles
* **Single Responsibility Principle (SRP):** Every class, function, and module has exactly one reason to change.
* **Open/Closed Principle (OCP):** Modules are open for extension via interfaces and abstraction, but closed for modification.
* **Liskov Substitution Principle (LSP):** Derived classes and implementations must be completely substitutable for their base abstractions.
* **Interface Segregation Principle (ISP):** Clients are never forced to depend on interfaces they do not use.
* **Dependency Inversion Principle (DIP):** High-level modules do not depend on low-level modules; both depend on abstractions.

### 2.6 Don't Repeat Yourself (DRY)
Duplication of domain logic, validation constraints, and response structures across modules is strictly forbidden. Shared logic must be housed within core utilities, shared middleware, or domain service helpers.

### 2.7 Keep It Simple, Stupid (KISS)
Avoid over-engineering. Do not write premature complex abstractions or speculative features. Write simple, explicit, self-documenting code with clear boundaries.

### 2.8 Separation of Concerns
Each layer in the backend runtime executes a distinct, non-overlapping responsibility. Controllers parse HTTP; Services execute business logic; Repositories query database tables; Middlewares handle cross-cutting concerns.

---

# 3. Folder Structure Rules

The official backend source tree for `apps/api/src` follows a strict modular hierarchy:

```
apps/api/src/
├── bootstrap/          # Server initialization, dependency injection, and process lifecycle
├── config/             # Environment validation, app constants, security policies, logger settings
├── core/               # Base domain classes, custom errors, global event emitters, base repositories
├── database/           # Prisma client initialization, seeders, transaction runners, migrations
├── middlewares/        # Express middlewares (auth, rbac, rate-limiting, request ID, error handler)
├── modules/            # Domain-driven feature modules (auth, users, clients, projects, payments, ai, etc.)
├── routes/             # Global API router definitions, versioning prefixes, health checks
├── shared/             # Reusable domain utilities, formatters, encryption, date helpers
├── types/              # Global TypeScript declarations, ambient module augmentations, Express types
├── utils/              # Pure functions, math helpers, text parsers, string generators
├── app.ts              # Express application configuration and middleware assembly
└── server.ts           # HTTP server bootstrapping and graceful shutdown handlers
```

### Folder Responsibilities

* `bootstrap/`: Encapsulates server startup procedures, pre-flight health checks, database connection tests, and graceful shutdown signal handlers (`SIGTERM`, `SIGINT`).
* `config/`: Validates and exports strongly-typed environment variables (via Zod schema verification) and centralized runtime configurations.
* `core/`: Houses abstract base classes (e.g., `BaseController`, `BaseService`, `BaseRepository`) and custom error class hierarchies.
* `database/`: Manages the single initialized Prisma Client instance, transaction wrappers, and database seed scripts.
* `middlewares/`: Contains pure, reusable Express middlewares for security headers, request ID generation, logger context binding, rate limiting, and global error handling.
* `modules/`: The core business domain directory. Each feature area exists as a self-contained module.
* `routes/`: Mounts v1 API route maps, health check endpoints (`/api/v1/health`), and metrics routes.
* `shared/`: Contains generic, non-domain-specific utilities such as password hashing helpers, UUID validators, and token generators.
* `types/`: Contains global TypeScript type definitions, including extensions to the Express `Request` context (e.g., `req.user`, `req.requestId`).

---

# 4. Module Structure

Every feature module inside `apps/api/src/modules/<module-name>/` **MUST** adhere to the following file layout:

```
<module-name>/
├── <module-name>.controller.ts   # HTTP Request/Response handling
├── <module-name>.service.ts      # Core business logic and workflow orchestration
├── <module-name>.repository.ts   # Prisma ORM data access operations
├── <module-name>.routes.ts       # Route declarations, route-level middleware bindings
├── <module-name>.validation.ts   # Zod validation schemas for Body, Query, Params
├── <module-name>.dto.ts          # Data Transfer Object TypeScript types derived from Zod
├── <module-name>.mapper.ts       # Mappers converting Database entities to API DTOs
├── <module-name>.constants.ts    # Module-specific constants, enums, cache keys
├── <module-name>.types.ts        # Internal module TypeScript interfaces
├── <module-name>.errors.ts       # Module-specific domain error definitions
└── index.ts                      # Barrel export file exposing public module components
```

### Layer Responsibilities

1. **Controller (`.controller.ts`):** 
   * Reads request parameters, query string, and request body.
   * Invokes the appropriate Service method.
   * Sends standardized HTTP responses using response utility helpers.
   * **STRICTLY FORBIDDEN:** Executing Prisma queries, mutating business data, or catching errors locally without propagating to global error handlers.

2. **Service (`.service.ts`):**
   * Encapsulates all domain rules, business state transitions, and validation workflows.
   * Invokes Repositories for data retrieval/persistence.
   * Triggers domain events, notifications, and external API integrations.
   * **STRICTLY FORBIDDEN:** Accessing Express `req` or `res` objects.

3. **Repository (`.repository.ts`):**
   * Executes Prisma Client database operations (`findUnique`, `findMany`, `create`, `update`, `delete`).
   * Handles database transaction context passing.
   * **STRICTLY FORBIDDEN:** Containing business decision logic, permission checks, or HTTP logic.

4. **Routes (`.routes.ts`):**
   * Declares Express `Router` instances.
   * Binds middlewares (`authenticate`, `authorize`, `validateRequest`, `rateLimit`).
   * Maps HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) to Controller actions.

5. **Validation (`.validation.ts`):**
   * Defines Zod schemas for `body`, `query`, and `params`.

6. **DTO (`.dto.ts`):**
   * Exports TypeScript types inferred directly from Zod validation schemas using `z.infer<typeof Schema>`.

7. **Mapper (`.mapper.ts`):**
   * Pure transformation functions that sanitize database models into API response objects (e.g., stripping `passwordHash`, internal tokens, or secret fields).

8. **Constants (`.constants.ts`):**
   * Houses module constants, lookup dictionaries, and event names.

9. **Types (`.types.ts`):**
   * Internal interfaces and parameter types utilized within the service and repository.

10. **Errors (`.errors.ts`):**
    * Custom domain exceptions inheriting from `AppError` specific to this domain (e.g., `UserNotFoundException`, `DuplicateEmailException`).

11. **Index (`index.ts`):**
    * Exposes clean module interfaces for consumption by other modules.

---

# 5. Request Flow

Every incoming HTTP request traverses a linear, deterministic pipeline:

```
[ HTTP Client Request ]
         │
         ▼
[ 1. Request ID Middleware ] ──► Generates/attaches unique UUID X-Request-ID
         │
         ▼
[ 2. Logger Middleware ] ──────► Instantiates request-scoped child Pino logger
         │
         ▼
[ 3. Security Middlewares ] ───► CORS, Helmet headers, IP rate-limiting
         │
         ▼
[ 4. Authentication ] ─────────► Verifies JWT Bearer token, attaches User Context (req.user)
         │
         ▼
[ 5. Authorization (RBAC) ] ───► Verifies user permissions against required route privileges
         │
         ▼
[ 6. Request Validation ] ─────► Validates Body, Query, Params against Zod schemas
         │
         ▼
[ 7. Controller ] ─────────────► Unpacks request parameters, delegates to Service
         │
         ▼
[ 8. Service ] ────────────────► Executes business logic, enforces domain constraints
         │
         ▼
[ 9. Repository ] ─────────────► Interacts with PostgreSQL database through Prisma ORM
         │
         ▼
[ 10. Database Response ] ──────► Returns sanitized entity/data array back to Service
         │
         ▼
[ 11. Mapper / Sanitizer ] ────► Converts domain model to public response DTO
         │
         ▼
[ 12. Standardized Response ] ──► Express sends formatted JSON response (Status 2xx)
```

### Exceptional Flow Handling
If any step between 1 and 9 throws an error or fails validation:
1. Execution immediately breaks out of the module chain.
2. The exception propagates to the **Global Error Handling Middleware**.
3. The error is logged with trace context (`requestId`, `userId`, `stack`).
4. A standardized JSON error payload is formatted and returned to the client.

---

# 6. Response Standard

All API endpoints must return structured JSON responses using a unified schema.

### 6.1 Success Response Schema (HTTP 200, 201)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    "id": "c7b3a9e2-4f1d-4b8a-9e3c-8f2a1d0e4b6a",
    "email": "user@st-solutions.com",
    "fullName": "Jane Doe",
    "accountType": "MEMBER",
    "createdAt": "2026-08-06T10:00:00.000Z"
  },
  "meta": {
    "requestId": "req_8f2a1d0e4b6a9c3d",
    "timestamp": "2026-08-06T10:15:30.123Z"
  }
}
```

### 6.2 Paginated Success Response Schema (HTTP 200)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "id": "e4b6a9c3-2a1d-4f1d-8f2a-8f2a1d0e4b6a",
      "title": "Enterprise Cloud Migration",
      "status": "IN_PROGRESS"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalRecords": 145,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "meta": {
    "requestId": "req_9c3d8f2a1d0e4b6a",
    "timestamp": "2026-08-06T10:15:30.123Z"
  }
}
```

### 6.3 Standard Error Response Schema (HTTP 4xx, 5xx)

```json
{
  "success": false,
  "statusCode": 404,
  "error": "NotFoundError",
  "message": "Project with ID 'e4b6a9c3-2a1d-4f1d-8f2a-8f2a1d0e4b6a' was not found",
  "meta": {
    "requestId": "req_1d0e4b6a9c3d8f2a",
    "timestamp": "2026-08-06T10:15:30.123Z"
  }
}
```

### 6.4 Validation Error Response Schema (HTTP 422)

```json
{
  "success": false,
  "statusCode": 422,
  "error": "ValidationError",
  "message": "Input validation failed for the provided request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address format"
    },
    {
      "field": "budget",
      "message": "Budget must be a positive number greater than 0"
    }
  ],
  "meta": {
    "requestId": "req_4b6a9c3d8f2a1d0e",
    "timestamp": "2026-08-06T10:15:30.123Z"
  }
}
```

---

# 7. Error Handling Rules

The backend employs a centralized, strongly-typed error handling class taxonomy inheriting from a base `AppError`.

### 7.1 Exception Hierarchy
* **`AppError` (Base Class):** Abstract operational exception containing `message`, `statusCode`, `errorCode`, `isOperational`, and `details`.
* **`ValidationError` (HTTP 422):** Thrown when Zod schema validation or input sanitization fails.
* **`AuthenticationError` (HTTP 401):** Thrown when JWT token is missing, invalid, or expired.
* **`AuthorizationError` (HTTP 403):** Thrown when user lacks required role/permission for a resource.
* **`NotFoundError` (HTTP 404):** Thrown when a requested record does not exist in the database.
* **`ConflictError` (HTTP 409):** Thrown when unique constraint or duplicate record conflict occurs.
* **`BusinessError` (HTTP 400):** Thrown when business rules are violated (e.g., approving an already completed payment).
* **`DatabaseError` (HTTP 500):** Wrapped internal database errors preventing raw SQL/Prisma details from leaking to clients.
* **`UnknownError` (HTTP 500):** Catch-all for unhandled server exceptions.

### 7.2 Error Propagation Principles
1. **Never suppress errors:** Empty `catch` blocks are strictly banned.
2. **Never leak raw stack traces to production:** Stack traces are included in log files only, never returned in HTTP JSON payloads.
3. **Wrap third-party exceptions:** Foreign SDK errors (e.g., Stripe, Twilio, SendGrid, Prisma) must be caught at service boundaries and re-thrown as typed `AppError` subclasses.

---

# 8. Logging Rules

Logging is powered by **Pino** structured JSON logging.

### 8.1 Log Categories & Levels
* **`FATAL`:** Critical server crashes, database connection loss, unrecoverable environment faults.
* **`ERROR`:** Application exceptions, failed external API calls, business workflow failures.
* **`WARN`:** Deprecated API usage, approaching rate limits, transient soft failures.
* **`INFO`:** Key operational events (server start, user authentication, payment processing completion).
* **`DEBUG`:** Detailed execution flows, payload details (Development environment only).

### 8.2 Required Context Metadata
Every log entry must automatically attach:
* `requestId`: Unique request trace UUID.
* `userId`: ID of the authenticated user (if available).
* `environment`: `production` | `staging` | `development`.
* `timestamp`: ISO-8601 UTC timestamp.

### 8.3 Redaction Policy (STRICTLY BANNED LOG ITEMS)
The logger must automatically redact and **NEVER write the following to log files or standard output**:
* Plaintext passwords or credentials
* JWT tokens or session secrets
* Full credit card numbers or CVVs
* API key secrets
* Personal identifiers (SSN, National ID documents)

---

# 9. Naming Conventions

Strict casing rules apply across the entirety of the codebase:

| Entity | Casing Convention | Example |
| :--- | :--- | :--- |
| **Files** | `kebab-case` with dot suffix | `user-profile.service.ts`, `auth.controller.ts` |
| **Directories** | `kebab-case` | `user-management/`, `client-portal/` |
| **Variables / Functions** | `camelCase` | `getUserById()`, `totalRevenueAmount` |
| **Classes / Interfaces** | `PascalCase` | `UserService`, `IUserRepository` |
| **Enums** | `PascalCase` | `ProjectStatus`, `AccountType` |
| **Enum Values** | `UPPER_SNAKE_CASE` | `IN_PROGRESS`, `PENDING_REVIEW` |
| **Global Constants** | `UPPER_SNAKE_CASE` | `MAX_LOGIN_ATTEMPTS`, `JWT_EXPIRES_IN` |
| **Database Tables** | `PascalCase` (Prisma default) | `User`, `ProjectUpdate`, `AuditLog` |
| **Database Columns** | `camelCase` | `firstName`, `createdAt`, `passwordHash` |
| **DTO Types** | `PascalCase` with `Dto` suffix | `CreateProjectDto`, `UpdateUserDto` |

---

# 10. TypeScript Rules

TypeScript strict mode (`"strict": true`) is permanently enabled in `tsconfig.json`.

### Non-Negotiable Rules
1. **Zero `any` Usage:** The `any` type is completely banned. Use `unknown` with type guards or generics if a type is truly dynamic.
2. **Explicit Return Types:** Every public class method, service function, and utility function must declare an explicit return type (e.g., `async getUserById(id: string): Promise<UserDto>`).
3. **`readonly` Immutability:** DTO properties, request objects, and array parameters must be marked as `readonly` where mutation is not required.
4. **Prefer Interfaces for Objects:** Use `interface` for structural object definitions and repository contracts. Use `type` for unions, primitives, and mapped utility types.
5. **No Type Assertions Without Verification:** Avoid using `as` type assertions unless preceded by a runtime Zod or type-guard validation check. Never use non-null assertions (`!`) on optional fields without explicit error guards.

---

# 11. Prisma Rules

Prisma ORM handles all data access operations.

### Mandatory Rules
1. **Encapsulation in Repositories:** Direct calls to `prisma.<model>` inside Express controllers or services are **strictly forbidden**. All database calls must occur within dedicated `.repository.ts` classes.
2. **Explicit Field Selection (`select`):** Avoid returning entire database rows by default (`findMany` without `select`). Explicitly specify needed fields using `select` to minimize database payload bandwidth and prevent accidental exposure of password hashes or internal fields.
3. **Pagination Required:** All collection retrieval methods (`findMany`) must enforce pagination (`take` and `skip`). Unbounded `findMany()` calls are banned.
4. **Database Transactions:** Multi-record write operations or dependent queries must be executed inside a Prisma transaction (`prisma.$transaction`).
5. **Database Index Optimization:** Query filters (`where`), sorting fields (`orderBy`), and foreign key lookups must be covered by appropriate indexes in `schema.prisma`.

---

# 12. Security Rules

### 12.1 Authentication & Secrets
* JWT tokens must be signed with strong secrets (`JWT_SECRET`) loaded exclusively from environment variables.
* Passwords must be hashed using `bcrypt` with a minimum cost factor of 12.
* API key hashes and webhook secrets must be generated using `crypto.scrypt` or HMAC SHA-256.

### 12.2 Request Protection
* **Rate Limiting:** Public endpoints (e.g., `/auth/login`, `/contact`) must enforce IP rate limiting via `express-rate-limit`.
* **Helmet:** Express app must mount `helmet()` to enforce standard security headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`).
* **CORS:** CORS must be explicitly locked down to approved domain origins defined in configuration.

### 12.3 Input Sanitization & Validation
* Every API request containing `body`, `query`, or `params` must pass through Zod schema middleware before reaching any controller action.
* HTML tags in string inputs must be sanitized to protect against Cross-Site Scripting (XSS).

---

# 13. Middleware Execution Order

Middlewares in `app.ts` must strictly observe the following mounting sequence:

```ts
// 1. Request Identification & Tracing
app.use(requestIdMiddleware);

// 2. Structured Request Logging
app.use(pinoLoggerMiddleware);

// 3. Security Headers & Protection
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiterMiddleware);

// 4. Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 5. Public Routes (Health, Webhooks, Docs)
app.use("/api/v1/health", healthRouter);

// 6. Authentication Middleware (Attaches req.user)
app.use(authenticateJWT);

// 7. Protected Module Routers
app.use("/api/v1", globalApiV1Router);

// 8. 404 Route Not Found Middleware
app.use(notFoundHandlerMiddleware);

// 9. Global Error Handling Middleware (MUST BE LAST)
app.use(globalErrorHandlerMiddleware);
```

---

# 14. Code Review Checklist (30+ Checkpoints)

Before any backend code is merged or approved, it must pass all 32 review checkpoints:

### Architecture & Layering
* [ ] 1. Is the feature separated into a dedicated directory within `apps/api/src/modules/`?
* [ ] 2. Are controller functions thin, delegating all domain rules to the service layer?
* [ ] 3. Are services completely free of Express `req` and `res` dependencies?
* [ ] 4. Is all Prisma database access contained strictly inside `.repository.ts` files?
* [ ] 5. Does every module export clean interfaces through its `index.ts` barrel file?

### TypeScript & Typing
* [ ] 6. Is `"strict": true` fully respected with zero TypeScript errors?
* [ ] 7. Is the codebase entirely free of the `any` keyword?
* [ ] 8. Does every function and method declare an explicit return type?
* [ ] 9. Are optional properties safely handled using optional chaining or guards?
* [ ] 10. Are DTO types derived directly from Zod validation schemas?

### Validation & Error Handling
* [ ] 11. Does every endpoint validate `body`, `params`, and `query` using Zod schemas?
* [ ] 12. Are all exceptions inherited from the central `AppError` base class?
* [ ] 13. Are raw database/SDK errors caught and wrapped in domain exceptions?
* [ ] 14. Is empty `catch` block error suppression completely absent?
* [ ] 15. Are stack traces excluded from production API JSON responses?

### Security & Data Privacy
* [ ] 16. Are sensitive fields (`passwordHash`, tokens) stripped using mappers before returning responses?
* [ ] 17. Are passwords hashed using `bcrypt` (work factor >= 12)?
* [ ] 18. Is role-based access control (RBAC) enforced on protected endpoints?
* [ ] 19. Is rate limiting configured for public or sensitive routes?
* [ ] 20. Are logs free of sensitive data (passwords, tokens, API keys)?

### Database & Prisma
* [ ] 21. Does every database query execute inside a repository class?
* [ ] 22. Are all collection queries (`findMany`) explicitly paginated?
* [ ] 23. Are queries using `select` to fetch only required fields?
* [ ] 24. Are multi-step database writes wrapped in Prisma transactions?
* [ ] 25. Are query filter fields covered by indexes in `schema.prisma`?

### API Consistency & Logging
* [ ] 26. Do success responses conform strictly to the standard JSON structure?
* [ ] 27. Do error responses conform strictly to the standard error JSON structure?
* [ ] 28. Is a unique `requestId` attached to all request logs and response metadata?
* [ ] 29. Are log entries formatted as structured JSON using Pino?

### Code Quality & Standards
* [ ] 30. Do file names, variable names, and class names strictly follow casing conventions?
* [ ] 31. Is duplicated logic eliminated through shared utilities or base classes?
* [ ] 32. Are environment variables validated at application bootstrap using Zod?

---

# 15. Build Requirements

Every pull request and build pipeline execution must execute and pass the following sequential validation commands:

1. **Type Check:**
   ```bash
   npx tsc --noEmit
   ```
2. **Linter Check:**
   ```bash
   npm run lint
   ```
3. **Prisma Schema Format & Validation:**
   ```bash
   npx prisma format
   npx prisma validate
   ```
4. **Prisma Client Generation:**
   ```bash
   npx prisma generate
   ```
5. **Production Bundle Compilation:**
   ```bash
   npm run build
   ```

A failure in any of these steps immediately halts deployment and fails the pipeline.

---

# 16. Testing Requirements

The backend quality assurance suite encompasses four distinct testing tiers:

### 16.1 Unit Tests
* Target business logic inside Service classes and pure utility functions.
* External dependencies (Repositories, third-party APIs) must be fully mocked.
* Minimum code coverage threshold: **85%**.

### 16.2 Integration Tests
* Test Controller-to-Service-to-Repository interaction against a test database instance.
* Validate transaction rollbacks, database constraints, and custom error mapping.

### 16.3 Security Tests
* Verify rate limiter triggers on excessive requests.
* Test JWT authentication failures (expired token, invalid signature, missing header).
* Test RBAC authorization rejections (HTTP 403) on unauthorized roles.

### 16.4 Performance Tests
* Load testing critical API endpoints using k6 or Autocannon.
* Benchmark 95th percentile latency: `< 200ms` for standard REST queries.

---

# 17. Future Compatibility

The backend architecture is engineered to guarantee seamless forward compatibility with modern cloud and microservice paradigms:

* **Containerization:** The application is fully compatible with standard Docker containers and container orchestrators (Kubernetes, Cloud Run, Railway).
* **Distributed Caching:** State-free architecture allows immediate drop-in integration of Redis for route caching and session storage.
* **Message Queues:** Services communicate via clear event signatures, permitting effortless extraction of asynchronous workflows to message queues (BullMQ, RabbitMQ, Kafka).
* **Microservice Extraction:** Independent module boundaries (`apps/api/src/modules/`) allow any single module to be extracted into a standalone microservice without rewriting domain logic.

---

# 18. Final Declaration

This document constitutes the **official, binding contract** for all backend development within the ST-Solutions Platform.

Any pull request, code submission, or automated generation that diverges from the structure, principles, standards, response formats, error handling guidelines, or review checkpoints specified herein **shall be deemed invalid and rejected**.

All future backend implementations starting from Phase 15.1 and beyond must honor this contract without exception.

---

**End of Document**
