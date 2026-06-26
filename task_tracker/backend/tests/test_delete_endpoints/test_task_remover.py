import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
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
def setup_task_remover_database():
    async def init():
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        # Insert a sample row
        async with AsyncTestingSessionLocal() as session:
            entry = TaskHistory(
                timestamp=999,
                readable="2026-06-20",
                name="Sample Task",
                tasks=["a", "b"],
                analysis={"x": 1},
                statuses={"done": False},
                total_estimated_hours=5,
                remaining_estimated_hours=5
            )
            session.add(entry)
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
# TEST: Successful deletion
# -----------------------------

def test_delete_task_success(client):
    response = client.delete("/task_remover/999")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "deleted"
    assert data["timestamp"] == 999

    async def check_db():
        async with AsyncTestingSessionLocal() as session:
            result = await session.execute(
                select(TaskHistory).where(TaskHistory.timestamp == 999)
            )
            assert result.scalar_one_or_none() is None

    asyncio.run(check_db())


# -----------------------------
# TEST: Deleting non-existent timestamp
# -----------------------------

def test_delete_task_not_found(client):
    response = client.delete("/task_remover/123456")
    assert response.status_code == 500
    assert "No entry found" in response.json()["detail"]
