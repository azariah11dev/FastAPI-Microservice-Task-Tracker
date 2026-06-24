from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.usersdb import Users
from services.dependencies.jwt_depencency import get_current_user

user_role_router = APIRouter(prefix="/user_role", tags=["user_role"])


@user_role_router.put("/assign_role")
async def assign_role(username: str, role: str, session: AsyncSession = Depends(get_async_session), current_user: Users = Depends(get_current_user)
):
    # Only Admins can assign roles
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized.")

    allowed_roles = ["Admin", "User"]

    if role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}")
    result = await session.execute(select(Users).where(Users.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.role = role
    await session.commit()
    await session.refresh(user)

    return {"status": "ok", "message": f"{role} assigned to user {username}."}