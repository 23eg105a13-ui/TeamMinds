# CodeWorks 3.0 – Autonomous AI Platform

A premium, production-ready AI platform for autonomous code review, refactoring, and fix validation.

## 🚀 Quick Start (Windows)

1.  **Configure API Key**:
    - Open `backend/.env`.
    - Set your `GROQ_API_KEY=gsk_...`.
2.  **Run All-in-One**:
    - Double-click **`start_app.bat`** in the root directory.
    - This will install dependencies and launch both the Backend and Frontend.

## 🛠️ Manual Launch

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend (React + TS)
```bash
cd frontend-react
npm install
npm run dev
```

## ✨ Core Features
- **Review Engine**: Deep analysis using Llama 3.3 70B.
- **Validation Engine**: Automated unit testing of AI fixes.
- **GitHub Analyzer**: Repository-wide health scoring.
- **Persistence**: Full SQLite history system.

---
© 2026 CodeWorks Corp.
