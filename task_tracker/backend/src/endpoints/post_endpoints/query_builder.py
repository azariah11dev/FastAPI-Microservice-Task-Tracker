from fastapi import APIRouter, HTTPException

from schemas.endpoint_schemas import QueryBuilderRequest, QueryBuilderResponse
from services.search_model.query import Query
from services.search_model.model import localModel

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