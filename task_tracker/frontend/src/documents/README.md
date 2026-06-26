# 🚀 TaskForge Frontend

The **TaskForge Frontend** is a modern **Next.js** application that provides the user interface for the TaskForge productivity platform. It enables users to authenticate, analyze tasks with AI, manage task history, view analytics, and administer user roles through a responsive and intuitive interface.

Built with **Next.js App Router**, **React**, **TypeScript**, and **Tailwind CSS**, the frontend communicates seamlessly with the TaskForge FastAPI backend.

---

## ✨ Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected application routes
- Persistent user sessions
- Role-based user interface

### 🤖 AI Task Management

- Submit tasks for AI analysis
- Generate intelligent task breakdowns
- View task history
- Manage completed tasks

### 📊 Dashboard & Analytics

- Interactive dashboard
- Task analytics
- Productivity insights
- Task management interface

### 👥 User Administration

- Role-based navigation
- Admin-only pages
- User role management

### 🧪 Testing

- Unit testing with **Jest**
- Component testing with **React Testing Library**
- End-to-end testing with **Playwright**

---

# 🏗️ Architecture

The application follows the **Next.js App Router** architecture with a clear separation between public and authenticated routes.

```
Public Routes
      │
      ▼
 Login / Register
      │
      ▼
 JWT Authentication
      │
      ▼
Protected Application
      │
 ├── Dashboard
 ├── Analytics
 ├── Task Management
 ├── Task History
 └── User Administration
```

The frontend communicates with the FastAPI backend for:

- Authentication
- AI task analysis
- Task persistence
- Analytics
- User management

---

# 📁 Project Structure

```text
frontend/
├── src/
│
│   ├── app/
│   │
│   │   ├── (public)/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── demo/
│   │   │   ├── features/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── components/
│   │   │
│   │   ├── (protected)/
│   │   │   ├── analytics/
│   │   │   ├── completed-tasks/
│   │   │   ├── create-task/
│   │   │   ├── dashboard/
│   │   │   ├── task-history/
│   │   │   ├── task-management/
│   │   │   ├── user-roles/
│   │   │   └── components/
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   └── documents/
│
├── public/
│
├── __tests__/
│
├── tests/
│
├── package.json
├── package-lock.json
├── playwright.config.ts
├── jest.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 20+
- npm

---

## 1. Install Dependencies

Install all required packages:

```bash
npm install
```

The project uses:

| Purpose | File |
|---------|------|
| Dependencies | `package.json` |
| Locked Versions | `package-lock.json` |

The `node_modules` directory should **not** be committed to source control. It can always be recreated using:

```bash
npm install
```

---

## 2. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

# 🧪 Testing

## Run Unit & Component Tests

```bash
npm run test
```

---

## Run Tests in Watch Mode

```bash
npm run test:watch
```

---

## Run End-to-End Tests

```bash
npx playwright test
```

---

## Open Playwright UI

```bash
npx playwright test --ui
```

---

## Run a Single Playwright Test

```bash
npx playwright test tests/protected/dashboard.spec.ts
```

---

# 🔐 Authentication

The frontend authenticates users through the FastAPI backend using JWT tokens.

After a successful login, the application stores:

- Access Token
- Username
- User Role

Protected pages located under:

```text
src/app/(protected)/
```

require valid authentication before access is granted.

Role-based navigation ensures administrative pages are only available to authorized users.

---

# 📄 Application Pages

## Public Pages

- Landing Page
- About
- Features
- Demo
- Contact
- Login
- Sign Up

---

## Protected Pages

- Dashboard
- Create Task
- Task History
- Completed Tasks
- Analytics
- User Role Management

---

# 🛠️ Developer Workflow

Start the development server:

```bash
npm run dev
```

Run Jest tests:

```bash
npm run test
```

Run Playwright tests:

```bash
npx playwright test
```

Lint the project:

```bash
npm run lint
```

Format the code:

```bash
npm run format
```

---

# 🛠️ Technology Stack

## Framework

- Next.js (App Router)
- React

## Language

- TypeScript

## Styling

- Tailwind CSS

## Authentication

- JWT Authentication
- Protected Routes
- Role-Based Access Control (RBAC)

## Testing

- Jest
- React Testing Library
- Playwright

## Tooling

- ESLint
- PostCSS
- npm

---

# 🔗 Backend Integration

The frontend communicates with the TaskForge FastAPI backend to provide:

- User Authentication
- AI Task Analysis
- Task Creation
- Task History
- Analytics
- User Administration

---

# 📈 Design Goals

TaskForge Frontend was designed with the following principles:

- Modern App Router architecture
- Component-based design
- Type safety with TypeScript
- Responsive user experience
- Secure authentication
- Automated testing
- Modular scalability
- Maintainable codebase

---

# 🧪 Testing Strategy

The project includes multiple layers of testing.

### Unit Tests

- Navigation components
- Shared UI components

### Component Tests

- Protected pages
- Public pages
- Layout rendering

### End-to-End Tests

- Authentication flow
- Protected route access
- Dashboard navigation
- User role management
- Task management workflow

---

# 📄 License

This project is intended as a portfolio and educational project demonstrating modern frontend development using Next.js, TypeScript, Tailwind CSS, automated testing, and full-stack application architecture.