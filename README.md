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
- PostgreSQL / SQLite
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
├── frontend/
│   ├── src/
│   ├── public/
│   └── documents/
│       └── README.md
│
├── backend/
│   ├── src/
│   ├── tests/
│   └── documents/
│       └── README.md
│
└── README.md
```

---

## 📖 Documentation

Detailed documentation for each application can be found below.

### Frontend

📄 `frontend/documents/README.md`

Covers:

- UI architecture
- Next.js App Router
- Authentication
- Testing
- Developer workflow

---

### Backend

📄 `backend/documents/README.md`

Covers:

- API documentation
- Authentication
- AI pipeline
- Database models
- Testing
- Deployment

---

## 🎥 Demo

A complete walkthrough of the project is available here:

**YouTube**

> *(Demo link coming soon)*

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/azariah11dev/taskforge.git
```

Start the backend:

```bash
cd backend
```

See:

```
backend/documents/README.md
```

Start the frontend:

```bash
cd frontend
```

See:

```
frontend/documents/README.md
```

---

## 🎯 Project Goals

TaskForge was built to demonstrate modern full-stack software engineering practices, including:

- AI integration
- Full-stack application architecture
- Authentication & authorization
- Async API development
- Automated testing
- Modular software design
- Scalable project organization

---

## 👨‍💻 Author

**CodeArcade**

Python • AI • Backend • Full-Stack Development

GitHub

https://github.com/azariah11dev