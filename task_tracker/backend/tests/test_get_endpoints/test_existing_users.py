import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio

from app import app
from models.database import Base
from models.usersdb import Users
from services.dependencies.model_dependency import get_async_session
from services.dependencies.jwt_depencency import get_current_user


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
# USER MOCKS
# -----------------------------

class MockAdmin:
    id = 1
    username = "admin"
    email = "admin@example.com"
    role = "Admin"


class MockUser:
    id = 2
    username = "regular"
    email = "regular@example.com"
    role = "User"


# -----------------------------
# FIXTURE: CREATE TEST DB + USERS
# -----------------------------

@pytest.fixture(scope="module", autouse=True)
def setup_existing_user_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncTestingSessionLocal() as session:
            sample_users = [
                Users(
                    username="admin",
                    email="admin@example.com",
                    password_hash="x",
                    role="Admin",
                    is_active=True
                ),
                Users(
                    username="regular",
                    email="regular@example.com",
                    password_hash="x",
                    role="User",
                    is_active=True
                ),
            ]

            session.add_all(sample_users)
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
# TEST: Admin can access
# -----------------------------

def test_admin_can_access_all_users(client):
    async def mock_admin():
        return MockAdmin()

    app.dependency_overrides[get_current_user] = mock_admin

    response = client.get("/existing_users/all_users")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2  # admin + regular user

    assert {"id", "username", "email", "role"}.issubset(data[0].keys())


# -----------------------------
# TEST: Non-admin blocked
# -----------------------------

def test_non_admin_forbidden(client):
    async def mock_user():
        return MockUser()

    app.dependency_overrides[get_current_user] = mock_user

    response = client.get("/existing_users/all_users")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized."


# -----------------------------
# TEST: Missing token → 401
# -----------------------------

def test_missing_token_unauthorized(client):
    # Remove override so real dependency runs
    app.dependency_overrides.pop(get_current_user, None)

    response = client.get("/existing_users/all_users")
    assert response.status_code == 401  # JWT missing
