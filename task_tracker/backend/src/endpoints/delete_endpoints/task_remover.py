from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from services.dependencies.model_dependency import get_async_session
from models.taskdb import TaskHistory


taskRemover_router = APIRouter(prefix="/task_remover", tags=["task_remover"])


@taskRemover_router.delete("/{timestamp}")
async def delete_task_history(
    timestamp: int,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # 1. Fetch the row
        result = await session.execute(
            select(TaskHistory).where(TaskHistory.timestamp == timestamp)
        )
        entry = result.scalar_one_or_none()

        if entry is None:
            raise HTTPException(
                status_code=404,
                detail=f"No entry found with timestamp {timestamp}"
            )

        # 2. Delete it
        await session.delete(entry)
        await session.commit()

        return {
            "status": "deleted",
            "timestamp": timestamp,
            "message": "Analysis entry deleted successfully"
        }

    except Exception as e:
        print("delete_task_history error:", e)
        raise HTTPException(status_code=500, detail=str(e))
