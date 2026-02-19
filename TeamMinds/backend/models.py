from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from database import Base
from pydantic import BaseModel
from typing import List, Optional
import datetime

# --- SQLAlchemy Models ---

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, default="sandbox.py")
    code = Column(Text)
    language = Column(String)
    analysis_type = Column(String) # Review, Rewrite, Validation
    
    # Analysis Content
    result_json = Column(Text) # Stores full JSON result
    summary = Column(Text)
    
    # Scores (New in 3.0)
    confidence_score = Column(Float)
    security_score = Column(Float)
    performance_score = Column(Float)
    quality_score = Column(Float)
    
    # Complexity & Analysis (New in 3.1 Refinement)
    time_complexity = Column(String)
    space_complexity = Column(String)
    resource_impact = Column(Text) # JSON string of RAM/CPU impact
    suggested_challenges = Column(Text) # JSON string of [{name, link}]
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# --- Pydantic Schemas ---

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    focus_areas: Optional[List[str]] = None

class ReviewResponse(BaseModel):
    critical_issues: List[str]
    high_issues: List[str]
    medium_issues: List[str]
    low_issues: List[str]
    improvement_summary: str
    confidence_score: float
    security_score: float
    performance_score: float
    quality_score: float
    # Refinement Fields
    time_complexity: str = "O(N)"
    space_complexity: str = "O(1)"
    resource_impact: str = "Low"
    suggested_challenges: List[dict] = [] # [{name, link, platform}]
    fixed_code: Optional[str] = None

class RewriteResponse(BaseModel):
    rewritten_code: str
    explanation: str
    performance_gain: str
    confidence_score: float

class GitHubRequest(BaseModel):
    repo_url: str

class GitHubAnalysisResponse(BaseModel):
    health: int
    issues: int
    categories: dict
    summary: str
    files: List[str]
    code_analysis: str
    project_suggestions: List[str]
    feature_ideas: List[str]

class ValidationTestResult(BaseModel):
    test_name: str
    original_status: str # PASS / FAIL
    rewritten_status: str # PASS / FAIL
    error_message: Optional[str] = None

class ValidationResponse(BaseModel):
    results: List[ValidationTestResult]
    security_boost: str
    performance_boost: str
    reliability_score: str
    suggested_challenges: List[dict] = []

class ExecRequest(BaseModel):
    code: str
    language: str = "python"

class ExecResponse(BaseModel):
    output: str
    error: str
    status: str # success / error

class AnalysisHistoryItem(BaseModel):
    id: int
    filename: str
    timestamp: datetime.datetime
    analysis_type: str
    summary: str
    confidence_score: float

    class Config:
        from_attributes = True
