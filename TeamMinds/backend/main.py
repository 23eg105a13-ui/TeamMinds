from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import logging
import os
from dotenv import load_dotenv

# Load environment variables ONLY locally
if not os.getenv("RENDER"):
    # Try both current dir and backend/ dir
    if os.path.exists(".env"):
        load_dotenv(".env")
    elif os.path.exists("backend/.env"):
        load_dotenv("backend/.env")

# Check for API Key
if not os.getenv("OPENAI_API_KEY"):
    print("\n" + "="*50)
    print("WARNING: OPENAI_API_KEY is not set in .env file!")
    print("AI features (Review, Rewrite, Test) will NOT work.")
    print("Please set it in backend/.env")
    print("="*50 + "\n")

# Initialize DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeWorks 3.0 API", version="3.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/api/health")
async def health_check():
    key = os.getenv("OPENAI_API_KEY", "")
    masked = f"{key[:7]}...{key[-4:]}" if len(key) > 10 else "NOT_SET"
    return {
        "status": "ok", 
        "api_key_set": bool(key), 
        "masked_key": masked,
        "env": "production" if os.getenv("RENDER") else "development"
    }

# Services
from review_service import review_router
from rewrite_service import rewrite_router
from test_service import test_router
from execution_service import execution_router
from github_service import github_router
from history_service import history_router
from validation_service import validation_router
from translate_service import translate_router

from fastapi.staticfiles import StaticFiles

# ... existing routers ...
app.include_router(review_router, prefix="/api/review", tags=["Review"])
app.include_router(rewrite_router, prefix="/api/rewrite", tags=["Rewrite"])
app.include_router(test_router, prefix="/api/test", tags=["Tests"])
app.include_router(execution_router, prefix="/api/execute", tags=["Execution"])
app.include_router(github_router, prefix="/api/github", tags=["GitHub"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(validation_router, prefix="/api/validation", tags=["Validation"])
app.include_router(translate_router, prefix="/api/translate", tags=["Translate"])

from fastapi.responses import FileResponse

# Serve frontend static files
# This assumes the frontend build (dist) folder is copied into backend/static
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If the request matches a real file in static, serve it
        file_path = os.path.join("static", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for React Router
        return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
