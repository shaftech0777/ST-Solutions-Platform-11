# Architecture Overview

ST-Solutions is structured as a TypeScript monorepo containing application services and shared libraries.

## Workspaces

1. **`apps/web`**: React + Vite single-page frontend interface.
2. **`apps/api`**: Express + TypeScript REST API backend.
3. **`packages/shared-config`**: Centralized configuration management.
4. **`packages/shared-types`**: Shared TypeScript interfaces and domain models.
5. **`packages/shared-utils`**: Utility functions shared across microservices and frontend.
