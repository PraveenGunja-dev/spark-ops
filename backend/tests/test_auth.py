"""
Tests for authentication endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserRole


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "testpassword123",
            "role": "viewer",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test registration with duplicate email"""
    user_data = {
        "email": "duplicate@example.com",
        "name": "Test User",
        "password": "testpassword123",
        "role": "viewer",
    }
    
    # First registration
    response1 = await client.post("/api/v1/auth/register", json=user_data)
    assert response1.status_code == 201
    
    # Second registration with same email
    response2 = await client.post("/api/v1/auth/register", json=user_data)
    assert response2.status_code == 400
    assert "already registered" in response2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login"""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "name": "Login User",
            "password": "loginpass123",
            "role": "viewer",
        },
    )
    
    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "loginpass123",
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Test login with wrong password"""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@example.com",
            "name": "Test User",
            "password": "correctpass123",
            "role": "viewer",
        },
    )
    
    # Login with wrong password
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpass123",
        },
    )
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient):
    """Test getting current user info"""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "current@example.com",
            "name": "Current User",
            "password": "currentpass123",
            "role": "viewer",
        },
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "current@example.com",
            "password": "currentpass123",
        },
    )
    
    access_token = login_response.json()["access_token"]
    
    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "current@example.com"
    assert data["name"] == "Current User"


@pytest.mark.asyncio
async def test_create_api_key(client: AsyncClient):
    """Test API key creation"""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "apikey@example.com",
            "name": "API Key User",
            "password": "apipass123",
            "role": "viewer",
        },
    )
    
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "apikey@example.com",
            "password": "apipass123",
        },
    )
    
    access_token = login_response.json()["access_token"]
    
    # Create API key
    response = await client.post(
        "/api/v1/auth/api-key",
        json={"name": "Test API Key"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "api_key" in data
    assert data["api_key"].startswith("sk_")
