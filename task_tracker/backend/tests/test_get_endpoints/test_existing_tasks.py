import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio

from app import app
from models.database import Base
from models.taskdb import TaskHistory
from services.dependencies.model_dependency import get_async_session


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
# FIXTURE: CREATE TABLE + SAMPLE ROW
# -----------------------------

@pytest.fixture(scope="module", autouse=True)
def setup_existing_tasks_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        # Insert sample rows
        async with AsyncTestingSessionLocal() as session:
            sample_rows = [
                TaskHistory(
                    timestamp=111,
                    readable="2026-06-20",
                    name="Task A",
                    tasks=["a1", "a2"],
                    analysis={"x": 1},
                    statuses={"done": False},
                    total_estimated_hours=5,
                    remaining_estimated_hours=5,   # NOT completed
                ),
                TaskHistory(
                    timestamp=222,
                    readable="2026-06-21",
                    name="Task B",
                    tasks=["b1"],
                    analysis={"y": 2},
                    statuses={"done": True},
                    total_estimated_hours=3,
                    remaining_estimated_hours=0,   # completed
                ),
            ]

            session.add_all(sample_rows)
            await session.commit()

    asyncio.run(init())


# -----------------------------
# FIXTURE: CLIENT (created AFTER DB setup)
# -----------------------------

@pytest.fixture
def client():
    # Apply DB override AFTER tables exist
    app.dependency_overrides[get_async_session] = override_get_async_session
    return TestClient(app)


# -----------------------------
# TEST: /existing_tasks
# -----------------------------

def test_existing_tasks_returns_non_completed(client):
    response = client.get("/task_retrieval/existing_tasks")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1  # only Task A

    task = data[0]
    assert task["name"] == "Task A"
    assert task["remaining_estimated_hours"] != 0


# -----------------------------
# TEST: /completed_tasks
# -----------------------------

def test_completed_tasks_returns_only_completed(client):
    response = client.get("/task_retrieval/completed_tasks")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1  # only Task B

    task = data[0]
    assert task["name"] == "Task B"
    assert task["remaining_estimated_hours"] == 0


# -----------------------------
# TEST: Response Structure
# -----------------------------

def test_response_structure(client):
    response = client.get("/task_retrieval/existing_tasks")
    assert response.status_code == 200

    task = response.json()[0]

    expected_keys = {
        "timestamp",
        "readable",
        "name",
        "tasks",
        "analysis",
        "statuses",
        "total_estimated_hours",
        "remaining_estimated_hours",
    }

    assert expected_keys.issubset(task.keys())
