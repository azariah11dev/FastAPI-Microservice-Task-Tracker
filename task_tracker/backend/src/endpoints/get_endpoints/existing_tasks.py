from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from services.dependencies.model_dependency import get_async_session
from models.taskdb import TaskHistory


tasks_router = APIRouter(prefix="/task_retrieval", tags=["task_retrieval"])


@tasks_router.get("/existing_tasks")
async def existing_tasks(session: AsyncSession = Depends(get_async_session)):
    try:
        query = (
            select(TaskHistory)
            .where(TaskHistory.remaining_estimated_hours != 0)
        )

        rows = (await session.execute(query)).scalars().all()

        output = [
            {
                "timestamp": row.timestamp,
                "readable": row.readable,
                "name": row.name,
                "tasks": row.tasks,
                "analysis": row.analysis,
                "statuses": row.statuses,
                "total_estimated_hours": row.total_estimated_hours,
                "remaining_estimated_hours": row.remaining_estimated_hours
            }
            for row in rows
        ]

        return output

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@tasks_router.get("/completed_tasks")
async def existing_tasks(session: AsyncSession = Depends(get_async_session)):
    try:
        query = (
            select(TaskHistory)
            .where(TaskHistory.remaining_estimated_hours == 0)
        )

        rows = (await session.execute(query)).scalars().all()

        output = [
            {
                "timestamp": row.timestamp,
                "readable": row.readable,
                "name": row.name,
                "tasks": row.tasks,
                "analysis": row.analysis,
                "statuses": row.statuses,
                "total_estimated_hours": row.total_estimated_hours,
                "remaining_estimated_hours": row.remaining_estimated_hours
            }
            for row in rows
        ]

        return output

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@tasks_router.get("/analytics")
async def existing_tasks(session: AsyncSession = Depends(get_async_session)):
    try:
        query = (
            select(TaskHistory)
            .where(TaskHistory.tasks != None)
        )

        rows = (await session.execute(query)).scalars().all()

        output = [
            {
                "timestamp": row.timestamp,
                "readable": row.readable,
                "name": row.name,
                "tasks": row.tasks,
                "analysis": row.analysis,
                "statuses": row.statuses,
                "total_estimated_hours": row.total_estimated_hours,
                "remaining_estimated_hours": row.remaining_estimated_hours
            }
            for row in rows
        ]

        return output

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))