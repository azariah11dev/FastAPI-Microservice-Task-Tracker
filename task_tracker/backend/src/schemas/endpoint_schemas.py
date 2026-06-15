from pydantic import BaseModel
from typing import List, Optional

# ------------------------------------------------
# Schemas for query_builder endpoint
# ------------------------------------------------

class TaskInfo(BaseModel):
    estimated_duration_hours: Optional[float] = None
    requirements: List[str] = []
    confidence_score: float = 0.0
    raw: Optional[str] = None

class QueryBuilderRequest(BaseModel):
    tasks: List[str]

class QueryBuilderResponse(BaseModel):
    queries: dict[str, TaskInfo]