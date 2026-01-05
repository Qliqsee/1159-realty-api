# 1159 Realty API

Multi-application API with authentication and role-based access control (RBAC).

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js (JWT + Google OAuth + Local)
- **Documentation**: Swagger/OpenAPI

## Features

- Email/password authentication
- Google OAuth authentication
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Context-based roles (client app vs CRM)
- User management
- Role and permission management
- API documentation with Swagger

## Getting Started

### Prerequisites

- Node.js (v20.19+ or v22.12+ or v24+)
- PostgreSQL database
- Google OAuth credentials (optional, for Google login)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your actual values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID (if using Google auth)
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (if using Google auth)
   - Other configuration as needed

5. Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev --name init
```

6. Seed the database with sample data:

```bash
npx prisma db seed
```

This will create:
- Sample roles: `customer` (client app), `admin` (CRM), `support` (CRM)
- Sample permissions for users, properties, roles
- Test users:
  - `admin@example.com` / `password123` (customer + admin roles)
  - `user@example.com` / `password123` (customer role only)

### Running the App

Development mode (with hot reload):

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

### API Documentation

Swagger documentation is available at: `http://localhost:3000/api/docs`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for signing JWT access tokens | `your-secret-key` |
| `JWT_EXPIRATION` | JWT access token expiration | `15m` |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens | `your-refresh-secret` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token expiration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-google-secret` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:3000/auth/google/callback` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:3001` |
| `PORT` | Server port | `3000` |

## API Endpoints

### Authentication

- `POST /auth/signup` - Register with email/password
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile (requires JWT)

### Users

All user endpoints require JWT authentication. Admin-only endpoints require the `admin` role.

- `GET /users/me` - Get current user profile
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID (admin only)
- `PATCH /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `POST /users/:id/roles` - Assign role to user (admin only)
- `DELETE /users/:id/roles/:roleId` - Remove role from user (admin only)
- `GET /users/:id/permissions` - Get user permissions (admin only)

### Roles & Permissions

All role endpoints require JWT authentication and `admin` role.

- `POST /roles` - Create role
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Assign permission to role
- `DELETE /roles/:id/permissions/:permissionId` - Remove permission from role
- `POST /roles/permissions` - Create permission
- `GET /roles/permissions/all` - List all permissions

## RBAC System

### How it Works

Users can have multiple roles across different application contexts (e.g., `client` app vs `crm`).

Example:
- User is a `customer` in the client app
- Same user is an `admin` in the CRM

Roles are context-specific:
```json
{
  "name": "admin",
  "appContext": "crm"
}
```

Each role can have multiple permissions:
```json
{
  "name": "users:read",
  "resource": "users",
  "action": "read"
}
```

### Using Guards in Controllers

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
findAll() {
  // Only users with 'admin' role can access this
}
```

## Multi-Application SSO

The API supports Single Sign-On across multiple frontend applications:

1. User logs in via any app
2. API returns JWT access token + refresh token
3. Frontend stores tokens
4. All requests include token in `Authorization: Bearer <token>` header
5. Same tokens work across all frontend apps
6. User permissions are checked based on their roles

## Database Schema

- **User**: id, email, password, googleId, name, timestamps
- **Role**: id, name, appContext, description, timestamps
- **Permission**: id, name, resource, action, description, timestamps
- **UserRole**: Junction table linking users to roles
- **RolePermission**: Junction table linking roles to permissions

## Deployment

### Render Deployment

1. Create PostgreSQL database on Render
2. Create Web Service on Render
3. Set environment variables in Render dashboard
4. Add build command: `npm install && npx prisma generate && npm run build`
5. Add start command: `npx prisma migrate deploy && npm run start:prod`

### Environment Variables for Production

Make sure to set all required environment variables in your Render dashboard:
- `DATABASE_URL` - Provided by Render PostgreSQL
- `JWT_SECRET` - Generate a secure random string
- `REFRESH_TOKEN_SECRET` - Generate a different secure random string
- All other variables from `.env.example`

## Development

### Generate Prisma Client

After modifying `prisma/schema.prisma`:

```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

## Testing

Test the API using Swagger UI at `http://localhost:3000/api/docs`

1. Sign up a new user or use test credentials
2. Login to get JWT token
3. Click "Authorize" in Swagger UI
4. Enter token in format: `Bearer <your_token>`
5. Test protected endpoints

## License

ISC
