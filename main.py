from fastapi import FastAPI, Query
from pydantic import BaseModel, Field
from datetime import datetime, timedelta

app = FastAPI()
submissions = []

class Submission(BaseModel):
    problem: str
    difficulty: int = Field(ge=1, le=5)

def calculate_due_date(difficulty: int) -> datetime:
    days = {1: 14, 2: 7, 3: 5, 4: 2, 5: 1,}[difficulty]
    return (datetime.today() + timedelta(days=days)).replace(microsecond=0)

@app.post('/submit')
async def submit(submission: Submission):
    data = submission.model_dump()
    data['submitted_at'] = datetime.today().replace(microsecond=0)
    data['due'] = calculate_due_date(submission.difficulty)
    existing = None
    for item in submissions:
        if item['problem'] == submission.problem:
            existing = item
            break
    if existing:
        existing['difficulty'] = submission.difficulty
        existing['submitted_at'] = data['submitted_at']
        existing['due'] = data['due']
    else:
        submissions.append(data)
    return submission


@app.get('/problems')
async def get_problems():
    return submissions


@app.get('/due')
async def due_problems(limit: int = Query(default=5, ge=1, le=10)):
    today = datetime.today().date()
    due = [item for item in submissions if item['due'].date() <= today]
    return due[:limit]