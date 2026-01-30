# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode

# Build & Production
npm run build              # Compile TypeScript
npm run start:prod         # Run compiled app

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Testing
npm run test               # Run Jest tests
npm run test:watch         # Tests in watch mode
npm run test:cov           # Coverage report

# Database Migrations (TypeORM)
npm run typeorm:generate   # Generate migration from entity changes
npm run typeorm:migrate    # Run pending migrations
npm run typeorm:revert     # Revert last migration

# Seeding
npm run seed               # Run database seed script
```

## Architecture Overview

**Stack:** NestJS 11 + TypeScript + GraphQL (Apollo) + TypeORM + PostgreSQL (Supabase)

**API:** GraphQL endpoint at `/graphql` with subscriptions via graphql-ws. Schema auto-generates to `src/schema.gql`.

**Module Pattern:** Each feature follows NestJS convention:
- `*.entity.ts` - TypeORM entity with `@ObjectType()` decorators for GraphQL
- `*.service.ts` - Business logic
- `*.resolver.ts` - GraphQL queries/mutations
- `*.module.ts` - Feature module
- `dto/` - Input/output DTOs with class-validator decorators
- `enums/` - Shared enum types (registered with `registerEnumType`)

**Key Modules:** `user/` (auth), `team/`, `player/`, `match/`, `match-event/`, `prediction/`, `news/`

## Error Handling

Use custom exception classes from `src/exception/exceptions.ts`:
- `BadRequestError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`, `InternalServerError`

Each module has translation codes in `src/exception/translation-codes/` for i18n support.

**ESLint enforces:** Do not import exceptions from `@nestjs/common` - use custom classes.

## Authentication

JWT-based via `@nestjs/passport`. Use `JwtAuthGuard` on resolvers. The guard extracts tokens from Authorization header and works with GraphQL context.

## Database

- Migrations in `src/db/migrations/` (timestamp-prefixed)
- Config: `src/config/migrations-local.config.ts`
- Entities discovered via glob pattern in app.module.ts

## Environment Variables

Required: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

Optional: `DB_SYNCH` (false), `DB_LOG` (false), `NAMESPACE` (develop/production), `JWT_EXPIRES_IN` (7d)

## Code Style

- Prettier: single quotes, trailing commas, 120 char width
- ESLint: TypeScript strict, no floating promises, no unused vars (except `_` prefix)
- Naming: camelCase code, kebab-case filenames
