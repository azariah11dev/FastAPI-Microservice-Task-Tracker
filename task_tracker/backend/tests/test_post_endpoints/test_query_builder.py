import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from unittest.mock import AsyncMock, MagicMock
import asyncio

from models.database import Base
from models.taskdb import TaskHistory

# -----------------------------
# TEST DATABASE SETUP
# -----------------------------

DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL, future=True)

AsyncTestingSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def override_get_async_session():
    async with AsyncTestingSessionLocal() as session:
        yield session


# -----------------------------
# FIXTURE: CREATE TABLES
# -----------------------------

@pytest.fixture(scope="session", autouse=True)
def setup_query_builder_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(init())


# -----------------------------
# MOCK AI PIPELINE
# -----------------------------

@pytest.fixture
def client_with_mock_ai(monkeypatch):
    # 1. Mock Query
    MockQuery = MagicMock()
    instance = MockQuery.return_value
    instance.generate_queries = AsyncMock(return_value=["query1", "query2"])
    instance.web_search = AsyncMock(return_value={"taskA": {"raw": 1}})

    # PATCH THE ROUTER'S IMPORTED SYMBOLS
    monkeypatch.setattr("endpoints.post_endpoints.query_builder.Query", MockQuery)

    # 2. Mock localModel
    MockModel = MagicMock()
    model_instance = MockModel.return_value
    model_instance.format_response.return_value = {
        "Task A": {"estimated_duration_hours": 2},
        "Task B": {"estimated_duration_hours": 1},
        "Task C": {"estimated_duration_hours": None},
    }

    monkeypatch.setattr("endpoints.post_endpoints.query_builder.localModel", MockModel)

    # 3. Import app AFTER patching
    from app import app
    from services.dependencies.model_dependency import get_async_session

    # 4. Apply DB override
    app.dependency_overrides[get_async_session] = override_get_async_session

    return TestClient(app)

# -----------------------------
# TEST: /analyze_tasks
# -----------------------------

def test_analyze_tasks(client_with_mock_ai):
    payload = {
        "tasks": ["Task A", "Task B", "Task C"]
        }

    response = client_with_mock_ai.post("/query_builder/analyze_tasks", json=payload)
    print("ERROR BODY:", response.json())
    assert response.status_code == 200

    data = response.json()["queries"]

    # Priority should be assigned based on estimated_duration_hours
    assert data["Task B"]["priority"] == 1
    assert data["Task A"]["priority"] == 2
    assert data["Task C"]["priority"] is None


# -----------------------------
# TEST: /save_tasks (INSERT)
# -----------------------------

def test_save_tasks_insert(client_with_mock_ai):
    payload = {
        "timestamp": 111,
        "readable": "2026-06-20",
        "name": "Test Insert",
        "tasks": ["a", "b"],
        "analysis": {
            "queries": {
                "a": {
                    "estimated_duration_hours": 2.5,
                    "confidence_score": 1.0,
                    "requirements": ["Internet connection", "Hearing device"]
                },
                "b": {
                    "estimated_duration_hours": 2.0, 
                    "confidence_score": 0.95, 
                    "requirements": ["Water", "snacks", "first aid kit"]
                }
            }
            },
        "statuses": {
            "a": "not started",
            "b": "not started"
            },
        "total_estimated_hours": 5,
        "remaining_estimated_hours": 5
    }

    response = client_with_mock_ai.post("/query_builder/save_tasks", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["logged_data"]["name"] == "Test Insert"


# -----------------------------
# TEST: /save_tasks (UPDATE)
# -----------------------------

def test_save_tasks_update(client_with_mock_ai):
    # Update the same timestamp
    payload = {
        "timestamp": 111,
        "readable": "2026-06-21",
        "name": "Updated Name",
        "tasks": ["x"],
        "analysis": {"queries": {
            "x": {
                "estimated_duration_hours": 2.5,
                "confidence_score": 1.0,
                "requirements": ["Internet connection", "Hearing device"]
                }
            }},
        "statuses": {"x": "completed"},
        "total_estimated_hours": 10,
        "remaining_estimated_hours": 0
    }

    response = client_with_mock_ai.post("/query_builder/save_tasks", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "updated"

    # Verify DB state
    async def check_db():
        async with AsyncTestingSessionLocal() as session:
            result = await session.execute(
                select(TaskHistory).where(TaskHistory.timestamp == 111)
            )
            row = result.scalar_one()
            assert row.name == "Updated Name"
            assert row.remaining_estimated_hours == 0

    asyncio.run(check_db())
