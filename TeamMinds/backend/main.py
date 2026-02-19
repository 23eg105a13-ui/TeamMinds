from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

@app.get("/")
def read_root():
    return {"message": "Welcome to CodeWorks 3.0 API"}

# Services
from review_service import review_router
from rewrite_service import rewrite_router
from test_service import test_router
from execution_service import execution_router
from github_service import github_router
from history_service import history_router
from validation_service import validation_router
from translate_service import translate_router

app.include_router(review_router, prefix="/api/review", tags=["Review"])
app.include_router(rewrite_router, prefix="/api/rewrite", tags=["Rewrite"])
app.include_router(test_router, prefix="/api/test", tags=["Tests"])
app.include_router(execution_router, prefix="/api/execute", tags=["Execution"])
app.include_router(github_router, prefix="/api/github", tags=["GitHub"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(validation_router, prefix="/api/validation", tags=["Validation"])
app.include_router(translate_router, prefix="/api/translate", tags=["Translate"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
