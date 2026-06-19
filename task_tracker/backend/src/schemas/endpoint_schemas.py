from pydantic import BaseModel
from typing import List, Optional, Dict

# ------------------------------------------------
# Schemas for query_builder endpoint /analyze_tasks
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


# ------------------------------------------------
# Schemas for query_builder endpoint /save_tasks
# ------------------------------------------------

class TaskQueryInfo(BaseModel):
    estimated_duration_hours: float
    confidence_score: float
    requirements: List[str]

class Analysis(BaseModel):
    queries: Dict[str, TaskQueryInfo]

class HistoryEntry(BaseModel):
    timestamp: int
    readable: str
    name: str
    tasks: List[str]
    analysis: Analysis
    statuses: Dict[str, str]
    total_estimated_hours: float
    remaining_estimated_hours: float