from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.endpoint_schemas import ContactInfo
from models.contactdb import ContactHistory
from services.dependencies.model_dependency import get_async_session
from schemas.endpoint_schemas import ContactInfo

contact_router = APIRouter(prefix="/contact", tags=["contact"])


@contact_router.post("/all_questions")
async def contact(
    payload: ContactInfo,
    session: AsyncSession = Depends(get_async_session)
    ):

    try:
        entry = ContactHistory(
            username = payload.name,
            email = payload.email,
            message = payload.message
        )

        session.add(entry)
        await session.commit()
        await session.refresh(entry)

        return {"report" : f"Report created by {payload.name}"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))