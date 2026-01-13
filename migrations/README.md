## Migrations

Place SQL files here in lexical order. Each file runs once and is recorded in `migrations_history`.

### Add a migration
1. Create `NNN-description.sql`
2. Write SQL
3. Run `npm run migrate` (or start the server) to apply pending files.

### Reset and reapply
- `npm run migrate:reset` drops and recreates the public schema, then reapplies all migrations.
