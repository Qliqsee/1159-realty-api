# Database Setup Guide

## Prerequisites

- Docker Desktop installed and running on your machine

## Local Development Setup

### First Time Setup

1. **Start Docker Postgres container**
   ```bash
   npm run db:local:up
   ```

2. **Run database migrations**
   ```bash
   npm run prisma:migrate:local
   ```

3. **Start the application**
   ```bash
   npm run start:dev:local
   ```

You should see: `Connected to database: realty_db at localhost:5432 (LOCAL)`

### Daily Development

As long as Docker Desktop is running:

```bash
npm run start:dev:local
```

The Postgres container will auto-start if it's stopped.

## Production/Remote Database

To connect to the Render Postgres instance:

```bash
npm run start:dev
```

You should see: `Connected to database: db_1159_realty_postgres at dpg-...render.com:5432 (REMOTE)`

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run db:local:up` | Start local Postgres container |
| `npm run db:local:down` | Stop container (keeps data) |
| `npm run db:local:reset` | Reset DB completely (deletes all data) |
| `npm run prisma:migrate:local` | Run migrations on local DB |
| `npm run prisma:studio:local` | Open Prisma Studio for local DB |
| `npm run start:dev:local` | Start app with local database |
| `npm run start:dev` | Start app with remote database (Render) |

## Database Configuration

- **Local DB**: Configured in `.env.local`
  - Host: localhost:5432
  - Database: realty_db
  - User: postgres
  - Password: postgres

- **Remote DB**: Configured in `.env`
  - Render Postgres instance

## Troubleshooting

**Issue**: `command not found: dotenv`
- The scripts use `npx dotenv-cli` which is already configured

**Issue**: Docker container won't start
- Ensure Docker Desktop is running
- Check if port 5432 is already in use: `lsof -i :5432`
- Try resetting: `npm run db:local:reset`

**Issue**: Connected to wrong database
- For local: Use `npm run start:dev:local`
- For remote: Use `npm run start:dev`
- Check the startup logs for `(LOCAL)` or `(REMOTE)` indicator
