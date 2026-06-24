from sqlalchemy import Column, String, DateTime, Integer, JSON, Float, BigInteger
from sqlalchemy.sql import func

from models.database import Base

class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)

    # When the row was inserted and changed
    modified_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Your timestamp (epoch ms)
    timestamp = Column(BigInteger, nullable=False)

    # Human-readable timestamp
    readable = Column(String, nullable=False)

    # "Analysis #1"
    name = Column(String, index=True, nullable=False)

    # List of tasks
    tasks = Column(JSON, nullable=False)

    # Full nested analysis object
    analysis = Column(JSON, nullable=False)

    # Task statuses
    statuses = Column(JSON, nullable=False)

    # Total number of hours for tasks
    total_estimated_hours = Column(Float, nullable=False)

    # Number of hours left as tasks are checked off
    remaining_estimated_hours = Column(Float, nullable=False)