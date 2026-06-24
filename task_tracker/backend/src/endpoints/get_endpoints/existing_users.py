from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from services.dependencies.model_dependency import get_async_session
from models.usersdb import Users
from services.dependencies.jwt_depencency import get_current_user

available_userRole_router = APIRouter(prefix="/existing_users", tags=["/existing_users"])


@available_userRole_router.get("/all_users")
async def get_all_users(
    session: AsyncSession = Depends(get_async_session), 
    current_user: Users = Depends(get_current_user)
    ):
    
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized.")

    result = await session.execute(select(Users))
    users = result.scalars().all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]
