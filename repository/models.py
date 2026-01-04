from sqlalchemy import Column, Integer, String, DateTime
from repository.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    problem = Column(String, unique=True, index=True)
    difficulty = Column(Integer)
    submitted_at = Column(DateTime)
    due = Column(DateTime)