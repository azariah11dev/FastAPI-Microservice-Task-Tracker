# 🚀 TaskForge

> **An AI-powered productivity platform that transforms vague goals into clear, actionable work plans.**

TaskForge helps users answer one simple question:

> **"What exactly should I do next?"**

Instead of functioning as another task tracker, TaskForge analyzes high-level goals, estimates effort, identifies prerequisites, and generates structured task plans that are easier to execute.

Built as a full-stack application, TaskForge combines modern web technologies with local AI models to deliver intelligent planning without depending entirely on cloud-based language models.

---

## ✨ Why TaskForge?

Most productivity applications assume users already know how to break down their work.

TaskForge focuses on the planning phase.

Rather than asking users to manually decide:

- Where to start
- How long a task might take
- What resources are required
- Which task should be completed first

TaskForge performs much of that analysis automatically.

---

## 🎯 Core Capabilities

- 🤖 AI-assisted task analysis
- 📋 Intelligent task decomposition
- ⏱️ Estimated completion times
- 📈 Priority recommendations
- 🔍 Search-enhanced task context
- 🔐 Secure authentication & user management
- 👥 Role-based administration
- 📊 Task history and analytics

---

## 🖥️ Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Jest
- Playwright

### Backend

- FastAPI
- SQLAlchemy (Async)
- PostgreSQL
- JWT Authentication
- Pydantic

### AI

- Ollama
- Lightweight Local LLMs
- Semantic Search
- Rule-Based Reasoning

---

## 🏛️ System Architecture

```text
                 User
                   │
                   ▼
        Next.js Frontend (React)
                   │
      ┌────────────┴────────────┐
      │                         │
Authentication            Task Management
      │                         │
      └────────────┬────────────┘
                   ▼
            FastAPI Backend
                   │
     ┌─────────────┼─────────────┐
     │             │             │
 Authentication   AI Engine   Task Services
     │             │             │
     └─────────────┼─────────────┘
                   ▼
              PostgreSQL
```

---

# 📂 Repository Structure

```text
TaskForge/
│
├── backend/
│   ├── src/
│   ├── tests/
│   └── documents/
│       └── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── documents/
│       └── README.md
│
├── runApp.ps1
└── README.md
```

---

# 🚀 Quick Start

TaskForge includes a PowerShell launcher that starts the complete development environment with a single command.

### Prerequisites

Install the following before running the project:

- Python 3.12+
- Node.js 20+
- Docker Desktop
- **uv** (Python package manager)

Install **uv**:

https://docs.astral.sh/uv/

---

### Clone the Repository

```bash
git clone https://github.com/azariah11dev/FastAPI-Microservice-Task-Tracker.git

cd FastAPI-Microservice-Task-Tracker/task_tracker
```

---

### Install Dependencies

Backend

```bash
cd backend

uv sync

cd ..
```

Frontend

```bash
cd frontend

npm install

cd ..
```

This only needs to be done the first time you set up the project.

---

### Start the Application

From the project root, run:

```powershell
.\runApp.ps1
```

The launcher automatically:

- Starts Docker services
- Launches the FastAPI backend
- Launches the Next.js frontend
- Opens the application in your default browser

Once started, the application is available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

Stop the application at any time with:

```text
CTRL + C
```

---

## 📖 Documentation

Detailed implementation documentation is available for each application.

### Frontend

📄 `frontend/documents/README.md`

Includes:

- UI architecture
- Next.js App Router
- Authentication
- Testing
- Developer workflow

---

### Backend

📄 `backend/documents/README.md`

Includes:

- API documentation
- Authentication
- AI pipeline
- Database models
- Testing
- Deployment

---

## 🎥 Demo

A complete walkthrough of the project is available here.

📺 **YouTube**

https://youtu.be/GeR2AkUbvpk

---

## 🎯 Project Goals

TaskForge was built to demonstrate modern software engineering practices, including:

- Full-stack application architecture
- AI integration
- Asynchronous backend development
- Authentication and authorization
- Automated testing
- REST API design
- Modular software architecture
- Containerized development
- Role-based access control

---

## 👨‍💻 Author

**CodeArcade**

Python • AI • Backend • Full-Stack Development

GitHub:

https://github.com/azariah11dev