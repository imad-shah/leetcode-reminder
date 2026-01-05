from fastapi import FastAPI, Query, Depends
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from repository.database import engine, SessionLocal, get_db
from repository.models import Base, Submission as SubmissionModel
from sqlalchemy.orm import Session

app = FastAPI()
Base.metadata.create_all(bind=engine)

class Submission(BaseModel):
    problem: str
    difficulty: int = Field(ge=1, le=5)

def calculate_due_date(difficulty: int) -> datetime:
    days = {1: 14, 2: 7, 3: 5, 4: 2, 5: 1,}[difficulty]
    return (datetime.today() + timedelta(days=days)).replace(microsecond=0)

def ordinal(day):
    suffix = ''
    if day == 11 or day == 12 or day == 13:
        suffix += 'th'
    else:
        last_digit = day % 10
        match (last_digit):
            case 1:
                suffix += 'st' 
            case 2:
                suffix += 'nd'
            case 3:
                suffix += 'rd'
            case _:
                suffix += 'th'
    return f'{day}{suffix}'

@app.post('/submit')
async def submit(submission: Submission, db: Session = Depends(get_db)):
    submitted_at = datetime.today().replace(microsecond=0)
    due = calculate_due_date(submission.difficulty)
    existing = db.query(SubmissionModel).filter(SubmissionModel.problem == submission.problem.lower().strip()).first()

    if existing:
        existing.difficulty = submission.difficulty # type: ignore
        existing.submitted_at = submitted_at # type: ignore
        existing.due = due # type: ignore

    else:
        db_submission = SubmissionModel(
            problem=submission.problem.lower().strip(),
            difficulty=submission.difficulty,
            submitted_at=submitted_at,
            due=due
        )
        db.add(db_submission)
    db.commit()
    return f'Problem {submission.problem.title()} solved. Due next on {due.strftime("%B")} {ordinal(int(due.strftime('%-d')))}'

@app.get('/problems')
async def get_problems(db: Session = Depends(get_db)):
    return db.query(SubmissionModel).all()

@app.get('/due')
async def due_problems(limit: int = Query(default=5, ge=1, le=10), db: Session = Depends(get_db)):
    due = db.query(SubmissionModel).filter(SubmissionModel.due <= datetime.today()).order_by(SubmissionModel.due.asc()).limit(limit).all()
    return due