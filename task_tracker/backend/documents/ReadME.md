# 🚀 Task Forge Backend

A fully asynchronous **FastAPI microservice** that powers the Task Forge platform by providing AI-assisted task analysis, authentication, task management, and user reporting.

The backend is built using **FastAPI**, **SQLAlchemy 2.0 (Async)**, **JWT authentication**, and **uv** for fast dependency management and reproducible development environments.

---

## ✨ Features

### 🤖 AI-Powered Task Analysis

- Analyze user tasks using local LLMs through **Ollama**
- Generate structured search queries
- Estimate task priority based on expected duration
- Save analyzed tasks for future reference

### 📋 Task Management

- Retrieve active and completed tasks
- Store task metadata and AI analysis
- Delete task history entries
- Manage task lifecycle

### 👤 User Management

- User registration
- Secure JWT authentication
- Role-Based Access Control (RBAC)
- Admin role assignment
- Retrieve registered users (Admin only)

### 📨 Report Collection

- Submit questions, bug reports, and feedback
- Store user submissions for review

---

# 🏗️ Architecture

The project follows a modular architecture separating:

- API endpoints
- Database models
- Request/response schemas
- Authentication services
- AI services
- Dependency injection
- Test suite

This structure keeps the codebase scalable, maintainable, and easy to extend.

---

# 📁 Project Structure

```text
backend/
├── documents/
│   ├── docker.txt
│   ├── postgres.txt
│   └── ReadME.md
│
├── src/
│   ├── app.py
│   ├── main.py
│   │
│   ├── endpoints/
│   │   ├── delete_endpoints/
│   │   │   └── task_remover.py
│   │   │
│   │   ├── get_endpoints/
│   │   │   ├── existing_tasks.py
│   │   │   └── existing_users.py
│   │   │
│   │   ├── post_endpoints/
│   │   │   ├── contact.py
│   │   │   ├── query_builder.py
│   │   │   └── user_auth.py
│   │   │
│   │   └── put_endpoints/
│   │       └── role_assignment.py
│   │
│   ├── models/
│   │   ├── contactdb.py
│   │   ├── database.py
│   │   ├── taskdb.py
│   │   └── usersdb.py
│   │
│   ├── schemas/
│   │   ├── endpoint_schemas.py
│   │   ├── model_schemas.py
│   │   └── user_auth_schema.py
│   │
│   └── services/
│       ├── auth/
│       │   └── jwt_handler.py
│       │
│       ├── dependencies/
│       │   ├── jwt_dependency.py
│       │   └── model_dependency.py
│       │
│       └── search_model/
│           ├── model.py
│           └── query.py
│
├── tests/
│   ├── conftest.py
│   ├── test_delete_endpoints/
│   ├── test_get_endpoints/
│   ├── test_post_endpoints/
│   └── test_put_endpoints/
│
├── docker-compose.yml
├── dockerfile
├── pyproject.toml
└── uv.lock
```

---

# 🚀 Getting Started

## Prerequisites

- Python 3.12+
- uv
- Docker (optional, but will require code refactor)
- PostgreSQL (or SQLite for development)
- Ollama (for local AI inference)

---

## 1. Install uv

### Linux / macOS

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows (PowerShell)

```powershell
iwr https://astral.sh/uv/install.ps1 -useb | iex
```

Verify the installation:

```bash
uv --version
```

---

## 2. Install Dependencies

From the backend directory:

```bash
uv sync
```

This command will:

- Create a virtual environment
- Install project dependencies
- Lock dependency versions
- Prepare the project for development

---

## 3. Start the Development Server

Create a .env file in src root.
Follow structure of .env.example
- for SERPER_API_KEY you need an account from https://serper.dev/login you can easily find api keys there

```bash
uv run uvicorn app:app --reload
```

The API will be available at:

```
http://localhost:8000
```

### API Documentation

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# 📡 API Endpoints

## Task Management

### Delete Task

```http
DELETE /task_remover/{timestamp}
```

Deletes a task history entry.

---

### Retrieve Active Tasks

```http
GET /task_retrieval/existing_tasks
```

Returns all active and in-progress tasks.

---

### Retrieve Completed Tasks

```http
GET /task_retrieval/completed_tasks
```

Returns completed task history.

---

## User Management

### Register User

```http
POST /auth/register
```

Creates a new user account.

---

### Login

```http
POST /auth/login
```

Authenticates a user and returns a JWT access token.

---

### Assign User Role *(Admin Only)*

```http
POST /auth/assign_role
```

Assigns a role to an existing user.

---

### Retrieve Users *(Admin Only)*

```http
GET /existing_users/all_users
```

Returns all registered users.

---

## AI Task Analysis

### Analyze Tasks

```http
POST /query_builder/analyze_tasks
```

Uses a local LLM to:

- Analyze task descriptions
- Estimate priorities
- Generate search queries

---

### Save Tasks

```http
POST /query_builder/save_tasks
```

Persists analyzed task data to the database.

---

## Reports & Feedback

### Submit Feedback

```http
POST /contact/all_questions
```

Accepts user questions, feature requests, and issue reports.

---

# 🧪 Testing

The project includes a comprehensive automated test suite covering:

- AI pipeline mocking
- Authentication
- JWT validation
- Role-Based Access Control
- CRUD operations
- Database dependency overrides
- Task retrieval
- Task deletion
- Report submission

Run the tests with:

```bash
uv run pytest -vv
```

---

# 🛠️ Tech Stack

## Backend

- FastAPI
- Uvicorn

## Async Runtime

- asyncio
- httpx
- aiosqlite
- asyncpg

## Database

- SQLAlchemy 2.0 (Async)
- SQLite
- PostgreSQL

## Authentication & Security

- python-jose
- Argon2
- passlib

## AI Integration

- Ollama

## Validation & Configuration

- Pydantic v2
- pydantic-settings

## Testing

- pytest

## Package Management

- uv

---

# 🔐 Authentication

The API uses modern authentication and authorization practices.

- Passwords are securely hashed using **Argon2**
- JWT access tokens are issued upon successful login
- Protected endpoints require valid bearer tokens
- Administrative routes are secured using Role-Based Access Control (RBAC)

---

# 🐳 Deployment

The project is container-ready and includes:

- Dockerfile
- Docker Compose configuration
- PostgreSQL support
- Reproducible environments with `uv`

---

# 📈 Design Goals

Task Forge Backend was designed with the following principles:

- Fully asynchronous architecture
- Modular project organization
- Scalable API design
- Clear separation of concerns
- Local AI integration
- Secure authentication
- Easy deployment
- Comprehensive automated testing

---

# 🔗 Frontend Integration

This backend is designed to integrate seamlessly with the **Task Forge Next.js frontend**, providing:

- Authentication APIs
- AI-powered task analysis
- Task persistence
- User management
- Feedback collection

---

## 📄 License

This project is intended as a portfolio and educational project demonstrating modern backend development with FastAPI, asynchronous Python, AI integration, and secure API design.