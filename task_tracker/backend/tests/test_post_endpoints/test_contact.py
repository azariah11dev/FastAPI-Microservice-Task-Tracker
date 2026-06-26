import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import asyncio

from app import app
from models.contactdb import ContactHistory
from models.database import Base
from services.dependencies.model_dependency import get_async_session


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


@pytest.fixture(scope="session", autouse=True)
def setup_contact_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(init())


# -----------------------------
# FIXTURE: CLIENT (created AFTER DB setup)
# -----------------------------

@pytest.fixture
def client():
    # Apply DB override AFTER tables exist
    app.dependency_overrides[get_async_session] = override_get_async_session
    return TestClient(app)


def test_contact_submission_success(client):
    payload = {
        "name": "Azariah",
        "email": "azariah@example.com",
        "message": "This is a test message",
    }

    response = client.post("/contact/all_questions", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["report"] == "Report created by Azariah"

    async def check_db():
        async with AsyncTestingSessionLocal() as session:
            result = await session.execute(select(ContactHistory))
            rows = result.scalars().all()
            assert len(rows) >= 1
            entry = rows[-1]
            assert entry.username == "Azariah"

    asyncio.run(check_db())


def test_contact_missing_fields(client):
    payload = {
        "name": "Azariah",
        "message": "Hello",
    }

    response = client.post("/contact/all_questions", json=payload)
    assert response.status_code == 422
