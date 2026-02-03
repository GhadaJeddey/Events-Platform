# Events Management Platform

## Project Description

Full-stack web application for managing campus events, organizations, and student registrations with role-based access control for students, organizers, and administrators.

### Key Features

**Students**: Browse events, register with capacity tracking, personalized dashboard, manage registrations and waitlists

**Organizers**: Create and manage events, request room reservations, track analytics, manage organization profile

**Administrators**: Approve/reject submissions, manage users and roles, handle room reservations, platform analytics

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Angular 21)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │  Organizer   │  │    Admin     │      │
│  │  Interface   │  │  Interface   │  │  Interface   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                          │                                   │
│                 ┌────────▼────────┐                         │
│                 │  Angular Router │                         │
│                 │   Auth Guards   │                         │
│                 └────────┬────────┘                         │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    HTTP/REST API (JSON)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  SERVER LAYER (NestJS)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Controllers Layer                       │   │
│  │  Auth │ Events │ Users │ Registrations │ Admin      │   │
│  └──────┬──────────────────────────────────────────────┘   │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │          Guards & Interceptors                       │   │
│  │  JWT Auth │ Role-Based Access │ Error Handling      │   │
│  └──────┬──────────────────────────────────────────────┘   │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │              Services Layer                          │   │
│  │  Business Logic │ Validation │ Email Service        │   │
│  └──────┬──────────────────────────────────────────────┘   │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │         TypeORM Repositories                         │   │
│  │  User │ Event │ Registration │ Organizer │ Room     │   │
│  └──────┬──────────────────────────────────────────────┘   │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│            DATABASE LAYER (PostgreSQL/Supabase)              │
│  ┌──────┐  ┌──────┐  ┌──────────────┐  ┌───────────┐      │
│  │Users │  │Events│  │Registrations │  │Organizers │      │
│  └──────┘  └──────┘  └──────────────┘  └───────────┘      │
│  Relations: One-to-Many, Many-to-One with foreign keys      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Angular 21.x (Standalone Components)
- **UI Library**: Angular Material 21.x, Bootstrap 5.3
- **State Management**: Signals API (signal, computed, effect)
- **Charts**: Chart.js 4.5 + ng2-charts 8.0
- **HTTP Client**: RxJS 7.8 with toSignal for reactive data
- **Notifications**: ngx-toastr 19.1
- **Authentication**: JWT with jwt-decode 4.0
- **Routing**: Angular Router with Guards (authGuard, adminGuard, organizerGuard)

#### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **ORM**: TypeORM 0.3.28
- **Database**: PostgreSQL 8.17 (Supabase Cloud)
- **Authentication**: Passport.js + JWT Strategy
- **Validation**: class-validator + class-transformer
- **Email**: @nestjs-modules/mailer with Handlebars templates
- **API Documentation**: Swagger/OpenAPI 11.0
- **File Upload**: Multer 2.0 (event images)


---

## Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── admin/                     # Admin management module
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── dto/                   # Data Transfer Objects
│   ├── auth/                      # Authentication & Authorization
│   │   ├── guards/                # JWT & Role guards
│   │   ├── decorators/            # Custom decorators (CurrentUser, Roles)
│   │   └── services/              # Auth logic (login, register, JWT)
│   ├── events/                    # Event management module
│   │   ├── entities/              # Event & Room Reservation entities
│   │   ├── services/              # Event CRUD + room booking logic
│   │   └── dto/                   # Create/Update DTOs
│   ├── organizers/                # Organization profiles
│   ├── registrations/             # Event registration & waitlist
│   ├── students/                  # Student profiles
│   ├── users/                     # User account management
│   ├── mail/                      # Email service (confirmations, notifications)
│   └── common/                    # Shared enums, templates, utilities
├── uploads/events/                # Event image storage
└── test/                          # E2E tests
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/
│   │   ├── features/              # Feature modules (lazy-loaded)
│   │   │   ├── admin/             # Admin dashboards & approvals
│   │   │   │   ├── dashboard/
│   │   │   │   ├── event-approval/
│   │   │   │   ├── organizer-approval/
│   │   │   │   ├── room-approval/
│   │   │   │   └── user-management/
│   │   │   ├── auth/              # Login, Register, Password Reset
│   │   │   ├── events/            # Event browsing, details, creation
│   │   │   ├── organizer/         # Organizer dashboard & analytics
│   │   │   │   ├── dashboard/     # Charts, stats, recent events
│   │   │   │   ├── all-my-events/ # Full event list with filters
│   │   │   │   ├── event-statistics/
│   │   │   │   └── organizers-list/
│   │   │   ├── student/           # Student dashboard & registrations
│   │   │   └── profile/           # User profile management
│   │   ├── guards/                # Route guards (auth, role-based)
│   │   ├── interceptors/          # HTTP interceptors (auth headers)
│   │   ├── services/              # API services (events, auth, admin)
│   │   └── shared/                # Reusable components & utilities
│   │       ├── components/        # Navbar, Footer, Search, Loader, etc.
│   │       ├── pipes/             # TruncatePipe, InputDatePipe
│   │       ├── models/            # TypeScript interfaces
│   │       └── directives/        # Custom directives
│   └── assets/                    # Static files (images, fonts)
└── angular.json                   # Angular CLI configuration
```

---

## Security Features

- JWT Authentication with bcrypt password hashing
- Role-Based Access Control (RBAC) with route guards
- Input validation with class-validator
- XSS Protection and CORS configuration

---

## Getting Started

### Prerequisites
- Node.js v20.x
- npm v11.x
- PostgreSQL (or Supabase account)

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd "Events Platform"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with database credentials
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ng serve -o
   ```

4. **Database Seeding** (Optional)
   ```bash
   cd backend
   npm run seed
   ```

### Environment Variables

**Backend (.env)**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=events_platform
JWT_SECRET=your-secret-key
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

---

## 📡 API Documentation

Once backend is running, access Swagger documentation at:
```
http://localhost:3000/api
```

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| GET | `/events` | List all events | No |
| POST | `/events` | Create event | Organizer/Admin |
| GET | `/events/:id` | Event details | No |
| POST | `/registrations/register` | Register for event | Student |
| GAPI Documentation

Swagger documentation: `http://localhost:3000/api`

**Key Endpoints**: `/auth/login`, `/auth/register`, `/events`, `/registrations/register`, `/admin/pending-events`

---

## Testing & Build

**Backend**
```bash
npm run test          # Unit tests
npm run build         # Production build
npm run start:prod    # Run production
```

**Frontend**
```bash
ng test               # Unit tests
ng build --configuration production
```

---

## License

UNLICENSED - RT4 Frameworks project