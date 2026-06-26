from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from models.database import create_db_and_tables
from endpoints.post_endpoints.user_auth import user_auth_router
from endpoints.post_endpoints.query_builder import query_router
from endpoints.post_endpoints.contact import contact_router
from endpoints.get_endpoints.existing_tasks import tasks_router
from endpoints.get_endpoints.existing_users import available_userRole_router 
from endpoints.delete_endpoints.task_remover import taskRemover_router
from endpoints.put_endpoints.role_assignment import user_role_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(title="Task Forge", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )

@app.get("/")
def root():
    return {
        "message": "Welcome to Task Forge API!",
        "endpoints": {
            "DELETE": {
                "Task Management": [
                    "/task_remover/{timestamp} - Remove tasks in taskdb"
                ],
            },
            "GET": {
                "Task Management": [
                    "/task_retrieval/existing_tasks - Retrieve created and in-progress tasks",
                    "/task_retrieval/completed_tasks - Retrieve completed tasks"
                ],
                "User Management": [
                    "/existing_users/all_users - Retrieve all available users in db (admin only)"
                ]
            },
            "POST": {
                "Report Management": [
                    "/contact/all_questions - Collect user reports or messages"
                ],
                "User Management": [
                    "/auth/login - User login",
                    "/auth/register - User registration",
                    "/auth/assign_role - Assign role to user (admin only)"
                ],
                "Query Builder": [
                    "/query_builder/analyze_tasks - Analyze tasks and generate search queries",
                    "/query_builder/save_tasks - Creates db entries for tasks users wants to keep"
                ]
            }
        }
    }

app.include_router(user_auth_router)
app.include_router(query_router)
app.include_router(tasks_router)
app.include_router(taskRemover_router)
app.include_router(user_role_router)
app.include_router(available_userRole_router)
app.include_router(contact_router)