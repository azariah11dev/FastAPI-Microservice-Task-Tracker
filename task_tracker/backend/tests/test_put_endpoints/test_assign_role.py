import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from unittest.mock import AsyncMock
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
# FIXTURE: CREATE TABLE + USERS
# -----------------------------

@pytest.fixture(scope="module", autouse=True)
def setup_assign_role_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        # Insert sample users
        async with AsyncTestingSessionLocal() as session:
            admin = Users(
                username="admin",
                email="admin@example.com",
                password_hash="x",
                role="Admin",
                is_active=True
            )
            user = Users(
                username="regular",
                email="regular@example.com",
                password_hash="x",
                role="User",
                is_active=True
            )
            session.add_all([admin, user])
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
# MOCK USERS
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
# TEST: Admin can assign role
# -----------------------------

def test_admin_assign_role(client):
    async def mock_admin():
        return MockAdmin()

    app.dependency_overrides[get_current_user] = mock_admin

    response = client.put("/user_role/assign_role?username=regular&role=Admin")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "Admin assigned to user regular" in data["message"]

    # Verify DB updated
    async def check_db():
        async with AsyncTestingSessionLocal() as session:
            result = await session.execute(
                select(Users).where(Users.username == "regular")
            )
            row = result.scalar_one()
            assert row.role == "Admin"

    import asyncio
    asyncio.run(check_db())


# -----------------------------
# TEST: Non-admin forbidden
# -----------------------------

def test_non_admin_forbidden(client):
    async def mock_user():
        return MockUser()

    app.dependency_overrides[get_current_user] = mock_user

    response = client.put("/user_role/assign_role?username=regular&role=User")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized."


# -----------------------------
# TEST: Invalid role
# -----------------------------

def test_invalid_role(client):
    async def mock_admin():
        return MockAdmin()

    app.dependency_overrides[get_current_user] = mock_admin

    response = client.put("/user_role/assign_role?username=regular&role=SuperAdmin")
    assert response.status_code == 400
    assert "Invalid role" in response.json()["detail"]


# -----------------------------
# TEST: User not found
# -----------------------------

def test_user_not_found(client):
    async def mock_admin():
        return MockAdmin()

    app.dependency_overrides[get_current_user] = mock_admin

    response = client.put("/user_role/assign_role?username=ghost&role=User")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found."
