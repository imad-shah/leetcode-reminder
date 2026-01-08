# LeetCode Reminder

A spaced repetition system for LeetCode problems. Track what you've solved on NeetCode and get reminded when to review.

## How It Works

When you complete a problem on NeetCode, a sliding popup asks you to rate the difficulty (1-5). Based on your rating, the problem is scheduled for review

Table for timings:
| Difficulty  | Review In |
|------------ | ----------|
| 1 (Trivial) | 14 days   |
| 2 (Easy)    | 7 days    |
| 3 (Medium)  | 5 days    |
| 4 (Hard)    | 2 days    |
| 5 (No clue) | 1 day     |

## Features

- **Chrome Extension** - Automatically detects problem completion on neetcode.io
- **Dashboard** - View all problems, due dates, and status at a glance
- **Discord Reminders** - Optional daily notifications for problems due


## Setup

### 1. Clone and install 

```bash
git clone https://github.com/imad-shah/leetcode-reminder
cd leetcode_reminder
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
### 2. Start the server
```bash
fastapi dev main.py
```
Dashboard available at http://127.0.0.1:8000

### 3. Install the Chrome extension
```
Go to chrome://extensions
Enable Developer mode
Click Load unpacked 
Select the extension/ folder
```
### 4. Use
```
1. Submit a problem on neetcode.io
2. Rate the difficulty with the slider
3. View dashboard to see summary
```
### Discord Reminders (Optional)
Get daily notifications for problems due.

```
cp .env.example .env
```
Edit .env with your Discord webhook URL

Test it:
```
python reminder.py
```
For automatic daily reminders, add a cron job:
```
crontab -e
```
For discord bot to autorun at noon everyday, run following command:
```
0 12 * * * cd /path/to/leetcode_reminder && venv/bin/python reminder.py 
```

