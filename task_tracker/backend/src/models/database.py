from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
import os

from schemas.model_schemas import settings

DATABASE_URL = settings.DATABASE_URL or os.getenv("DATABASE_URL")

def get_engine():
    if DATABASE_URL is None:
        raise RuntimeError("DATABASE_URL is required for database operations")
    return create_async_engine(DATABASE_URL, echo=True)

engine = get_engine()

class Base(DeclarativeBase):
    pass

async def create_db_and_tables():
    from models.usersdb import Users

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)