# 📘 Smart Task Decomposer

A full-stack AI-assisted productivity platform that transforms vague goals into structured, actionable work plans.

Instead of acting as a simple task tracker, Smart Task Decomposer helps users answer:

> **"What exactly do I need to do, how long will it take, and what do I need to get started?"**

The system combines lightweight local AI models, search-augmented intelligence, and deterministic reasoning to generate practical task breakdowns without relying entirely on large language models.

---

## 🎥 Demo Video

Watch the project walkthrough:

**YouTube Demo:**  
[Insert Demo Link Here](https://youtube.com/)

---

# 🚀 Overview

Many productivity tools require users to manually estimate:

- Task duration
- Priority
- Required resources
- Work order

Smart Task Decomposer automates this process.

Users submit high-level goals such as:

```json
[
  "Do physics homework",
  "Read quantum computing paper",
  "Prepare presentation"
]
```

The platform analyzes each goal and returns structured, schedulable tasks enriched with useful metadata.

Example:

```json
{
  "name": "Read quantum computing paper",
  "category": "reading",
  "estimated_duration_hours": 1.5,
  "requirements": [
    "Research paper"
  ],
  "priority": 2,
  "confidence_score": 0.89
}
```

---

# ✨ Features

## 🧩 AI Task Decomposition

Convert vague goals into structured work items.

Generated information includes:

- Estimated duration
- Priority ranking
- Required materials
- Category classification
- Confidence score

---

## 🧠 Lightweight Local AI

Uses small CPU-friendly models such as:

- MiniLM
- DistilBERT
- TinyLlama

Capabilities:

- Intent classification
- Semantic analysis
- Keyword extraction
- Task categorization

Designed to run on consumer hardware.

---

## 🔍 Search-Augmented Intelligence

The system enriches tasks with real-world information retrieved through search.

Examples:

- Average time required to complete a task
- Common prerequisites
- Recommended resources
- Typical workflows

This improves output quality without requiring expensive large-scale LLM inference.

---

## ⚙️ Rule-Based Reasoning Engine

A deterministic reasoning layer combines:

- AI predictions
- Search results
- Domain rules
- Keyword heuristics
- Fallback defaults

This approach improves consistency, explainability, and testability.

---

## 🔐 Authentication

JWT-based authentication supports:

- User registration
- User login
- Protected task management endpoints

---

## 💾 Task Management

Users can:

- Save generated tasks
- View previous analyses
- Delete completed tasks
- Manage personal work plans

---

# 🧠 How It Works

## Step 1: User Submits Goals

Example:

```json
[
  "Do physics homework",
  "Read quantum computing paper"
]
```

---

## Step 2: AI Classification

A lightweight local model analyzes each task and predicts:

- Category
- Intent
- Keywords
- Similarity patterns

Example categories:

- Homework
- Reading
- Research
- Presentation
- Writing

---

## Step 3: Search Enrichment

Relevant information is retrieved to estimate:

- Completion time
- Materials needed
- Common approaches

Example:

```text
average time to read a research paper
materials needed for a presentation
```

---

## Step 4: Rule-Based Reasoning

The reasoning engine combines:

- Model predictions
- Search insights
- Keyword heuristics
- Default business rules

---

## Step 5: Structured Task Output

Example:

```json
{
  "tasks": [
    {
      "name": "Read quantum computing paper",
      "category": "reading",
      "estimated_duration_hours": 1.5,
      "requirements": [
        "Research paper"
      ],
      "priority": 2,
      "confidence_score": 0.89
    }
  ]
}
```

---

# 🖥️ System Architecture

```text
User
 │
 ▼
Next.js Frontend
 │
 ├── Authentication UI
 ├── Task Management UI
 ├── Admin Dashboard (Admin Only)
 │
 ▼
FastAPI Backend
 │
 ├── Authentication Layer
 ├── Task Service
 ├── User Role Service (RBAC)
 ├── Tiny AI Model
 ├── Search Service
 └── Rule Engine
 │
 ▼
PostgreSQL

```

---

# 📡 API Endpoints

## Authentication

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

---

## Task Processing

### Convert Tasks

```http
POST /tasks/convert
```

Converts raw goals into structured task plans.

---

### Save Tasks

```http
POST /tasks/save
```

Stores generated tasks.

---

### Retrieve Tasks

```http
GET /tasks
```

Returns saved tasks.

---

### Delete Task

```http
DELETE /tasks/{id}
```

Removes a task.

---

# 🔧 Technology Stack

## Frontend

- Next.js
- React
- TailwindCSS
- JWT Authentication
- React Query (optional)

---

## Backend

- FastAPI
- Pydantic
- SQLite / PostgreSQL
- JWT Authentication

---

## AI Components

- MiniLM
- DistilBERT
- TinyLlama
- Local CPU Inference
- Semantic Similarity

---

## Testing

- Pytest
- API Integration Tests
- Rule Engine Tests
- Search Service Mocks
- Model Inference Tests

---

# 🧪 Testing

Run backend tests:

```bash
pytest
```

Testing includes:

- Authentication flows
- Task generation logic
- Rule engine validation
- Search integration
- API endpoints
- Model inference

---

# ⚙️ Installation

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Authentication

JWT-based authentication is used throughout the application.

Workflow:

1. Register account
2. Login
3. Receive access token
4. Access protected endpoints

Supported storage options:

- HTTP-only cookies
- Local storage

---

# 🎯 Example Use Cases

Smart Task Decomposer can be used for:

- Student workload planning
- Research task organization
- Personal productivity systems
- Academic project management
- Study planning
- Professional work scheduling
- Goal decomposition and planning

---

# 💼 Business Value

Most productivity tools focus on tracking tasks after they have already been defined.

Smart Task Decomposer focuses on an earlier and often more difficult problem:

> Turning vague goals into actionable plans.

By combining AI-assisted decomposition with deterministic reasoning, the platform helps users:

- Estimate workload more accurately
- Reduce planning friction
- Identify required resources
- Prioritize work effectively
- Create realistic schedules

---

# 🚧 Future Improvements

- Calendar integration
- Critical path analysis
- Team collaboration features
- Dependency graph visualization
- LLM-assisted task generation
- RAG-powered knowledge retrieval
- Multi-project planning
- Productivity analytics dashboard

---

# 📈 Skills Demonstrated

This project showcases:

- Full-stack development
- FastAPI architecture
- Next.js development
- JWT authentication
- AI integration
- Search-augmented systems
- Rule-based reasoning
- Database design
- API development
- System architecture
- Software testing

---

# 👨‍💻 Author

## CodeArcade

Python Automation • AI Systems • Backend Development • Data Engineering

Available for freelance projects involving:

- AI Applications
- Automation Systems
- Backend APIs
- Productivity Software
- Data Engineering
- Full-Stack Development

GitHub:  
https://github.com/azariah11dev