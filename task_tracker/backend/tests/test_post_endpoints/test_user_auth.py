import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch
import asyncio

from app import app
from models.database import Base
from models.usersdb import Users
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
# FIXTURE: CREATE TABLES
# -----------------------------

@pytest.fixture(scope="session", autouse=True)
def setup_user_auth_database():
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


# -----------------------------
# TEST: Successful Registration
# -----------------------------

def test_register_success(client):
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }

    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"


# -----------------------------
# TEST: Duplicate Username
# -----------------------------

def test_register_duplicate_username(client):
    payload = {
        "username": "testuser",  # already exists
        "email": "newemail@example.com",
        "password": "password123"
    }

    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already exists."


# -----------------------------
# TEST: Duplicate Email
# -----------------------------

def test_register_duplicate_email(client):
    payload = {
        "username": "anotheruser",
        "email": "test@example.com",  # already exists
        "password": "password123"
    }

    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already exists."


# -----------------------------
# TEST: Successful Login
# -----------------------------

@patch("endpoints.post_endpoints.user_auth.create_access_token", return_value="mocktoken123")
def test_login_success(mock_token, client):
    payload = {
        "username": "testuser",
        "password": "password123"
    }

    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["access_token"] == "mocktoken123"
    assert data["username"] == "testuser"
    assert data["role"] == "User"  # default role


# -----------------------------
# TEST: Incorrect Password
# -----------------------------

def test_login_wrong_password(client):
    payload = {
        "username": "testuser",
        "password": "wrongpassword"
    }

    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect password."


# -----------------------------
# TEST: Non-existent User
# -----------------------------

def test_login_user_not_found(client):
    payload = {
        "username": "idontexist",
        "password": "password123"
    }

    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "User does not exist."
