from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.endpoint_schemas import QueryBuilderRequest, QueryBuilderResponse
from services.search_model.query import Query
from services.search_model.model import localModel
from models.taskdb import TaskHistory
from services.dependencies.model_dependency import get_async_session
from schemas.endpoint_schemas import HistoryEntry


query_router = APIRouter(prefix="/query_builder", tags=["query_builder"])


@query_router.post("/analyze_tasks")
async def analyze_tasks(payload: QueryBuilderRequest):
    try:
        initiate_query = Query(request=payload.tasks)
        model = localModel()

        build_query = await initiate_query.generate_queries(model=model)
        raw_results = await initiate_query.web_search(build_query)
        model_interpretation = model.format_response(format_spec=raw_results)

        # Extract tasks with valid durations
        tasks_with_hours = [
            (task, data)
            for task, data in model_interpretation.items()
                if isinstance(data.get("estimated_duration_hours"), (int, float))
        ]

        # Sort by estimated hours (ascending)
        tasks_with_hours.sort(key=lambda x: x[1]["estimated_duration_hours"])

        # Assign priority based on sorted order
        for idx, (task, data) in enumerate(tasks_with_hours, start=1):
            data["priority"] = idx

        # For tasks without valid hours, assign None
        for task, data in model_interpretation.items():
            if "priority" not in data:
                data["priority"] = None

        return QueryBuilderResponse(queries=model_interpretation)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@query_router.post("/save_tasks")
async def save_tasks(
    data: HistoryEntry, 
    session: AsyncSession = Depends(get_async_session)
    ):

    try:
        entry = TaskHistory(
            timestamp=data.timestamp,
            readable=data.readable,
            name=data.name,
            tasks=data.tasks,
            analysis=data.analysis,
            statuses=data.statuses,
            total_estimated_hours=data.total_estimated_hours,
            remaining_estimated_hours=data.remaining_estimated_hours
        )

        session.add(entry)
        await session.commit()
        await session.refresh(entry)

        return {
            "status": "ok",
            "logged_data": {
                "id": entry.id,
                "timestamp": entry.timestamp,
                "readable": entry.readable,
                "name": entry.name,
                "tasks": entry.tasks,
                "analysis": entry.analysis,
                "statuses": entry.statuses,
                "total_estimated_hours": entry.total_estimated_hours,
                "remaining_estimated_hours": entry.remaining_estimated_hours,
                "modified_date": entry.modified_date
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))