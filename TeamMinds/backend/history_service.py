from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Analysis, AnalysisHistoryItem
from typing import List
from datetime import datetime
import json

history_router = APIRouter()

@history_router.get("")
def get_history(db: Session = Depends(get_db)):
    # Fetch latest 20 analyses
    analyses = db.query(Analysis).order_by(Analysis.timestamp.desc()).limit(20).all()
    
    history_items = []
    
    for a in analyses:
        summary = a.summary or "Analysis Complete"
        
        history_items.append(AnalysisHistoryItem(
            id=a.id,
            filename=a.filename or "sandbox.py",
            timestamp=a.timestamp,
            analysis_type=a.analysis_type or "Review",
            summary=summary,
            confidence_score=a.confidence_score or 0.0
        ))
        
    return history_items
