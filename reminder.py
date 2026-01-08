import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from repository.database import SessionLocal
from repository.models import Submission

load_dotenv()

WEBHOOK_URL = os.getenv('DISCORD_WEBHOOK_URL')
MAX_PROBLEMS = 5

def get_status(due_date):
    today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    due = due_date.replace(hour=0, minute=0, second=0, microsecond=0)
    diff_days = (due - today).days
    
    if diff_days < 0:
        return 'overdue'
    if diff_days == 0:
        return 'due_today'
    return 'upcoming'

def to_title_case(s):
    return ' '.join(word.capitalize() for word in s.split())

def format_date(dt):
    return dt.strftime('%b %-d')

def get_due_problems():
    db = SessionLocal()
    try:
        problems = db.query(Submission).all()
        
        overdue = []
        due_today = []
        
        for p in problems:
            status = get_status(p.due)
            if status == 'overdue':
                overdue.append(p)
            elif status == 'due_today':
                due_today.append(p)
        
        overdue.sort(key=lambda x: x.due)
        due_today.sort(key=lambda x: x.due)
        
        return overdue, due_today
    finally:
        db.close()

def build_embed(overdue, due_today):
    total_due = len(overdue) + len(due_today)
    
    if total_due == 0:
        return {
            "title": "📋 LeetCode Review Reminder",
            "description": "No problems due today! Keep up the good work.",
            "color": 0x48c78e
        }
    
    description_parts = []
    
    if overdue:
        description_parts.append("**🔴 Overdue**")
        for p in overdue[:MAX_PROBLEMS]:
            description_parts.append(f"• {to_title_case(p.problem)} ({format_date(p.due)})")
        if len(overdue) > MAX_PROBLEMS:
            description_parts.append(f"  *+{len(overdue) - MAX_PROBLEMS} more*")
        description_parts.append("")
    
    if due_today:
        description_parts.append("**🟡 Due Today**")
        remaining_slots = MAX_PROBLEMS - min(len(overdue), MAX_PROBLEMS)
        for p in due_today[:remaining_slots]:
            description_parts.append(f"• {to_title_case(p.problem)}")
        if len(due_today) > remaining_slots:
            description_parts.append(f"  *+{len(due_today) - remaining_slots} more*")
        description_parts.append("")
    
    description_parts.append(f"───────────────────")
    description_parts.append(f"**{total_due}** problem{'s' if total_due != 1 else ''} need{'s' if total_due == 1 else ''} review")
    
    return {
        "title": "📋 LeetCode Review Reminder",
        "description": "\n".join(description_parts),
        "color": 0xf14668 if overdue else 0xffc107
    }

def send_reminder():
    if not WEBHOOK_URL:
        print("Error: DISCORD_WEBHOOK_URL not set in .env")
        return
    
    overdue, due_today = get_due_problems()
    embed = build_embed(overdue, due_today)
    
    payload = {
        "embeds": [embed]
    }
    
    response = requests.post(WEBHOOK_URL, json=payload)
    
    if response.status_code == 204:
        print(f"Reminder sent successfully at {datetime.now()}")
    else:
        print(f"Failed to send reminder: {response.status_code} - {response.text}")

if __name__ == '__main__':
    send_reminder()
