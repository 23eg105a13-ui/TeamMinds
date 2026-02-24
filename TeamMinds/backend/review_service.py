from fastapi import APIRouter, HTTPException, Depends
from models import CodeRequest, ReviewResponse, Analysis
import google.generativeai as genai
import os
import json
from database import get_db
from sqlalchemy.orm import Session

review_router = APIRouter()

@review_router.post("")
async def review_code(request: CodeRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    
    prompt = f"""
    Analyze this {request.language} code. 
    Provide a detailed JSON response with these keys:
    - critical_issues: []
    - high_issues: []
    - medium_issues: []
    - low_issues: []
    - improvement_summary: string
    - confidence_score: float (0-1)
    - security_score: float (0-1)
    - performance_score: float (0-1)
    - quality_score: float (0-1)
    - time_complexity: string (Big-O notation)
    - space_complexity: string (Big-O notation)
    - resource_impact: string (Describe RAM/CPU impact briefly)
    - suggested_challenges: [{{ "name": "string", "link": "url", "platform": "string" }}] (Find ACTUAL similar problems from LeetCode, CodeChef, or HackerRank. For each challenge, provide the platform name in the 'platform' field. If unsure of the exact link, provide a search link to the platform for that problem name.)
    - fixed_code: string (optional)
    
    Code:
    {request.code}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text)
        
        # Save to DB
        analysis = Analysis(
            code=request.code,
            language=request.language,
            analysis_type="Review",
            result_json=json.dumps(data),
            summary=data.get("improvement_summary", ""),
            confidence_score=data.get("confidence_score", 0.5),
            security_score=data.get("security_score", 0.5),
            performance_score=data.get("performance_score", 0.5),
            quality_score=data.get("quality_score", 0.5),
            time_complexity=data.get("time_complexity", "Unknown"),
            space_complexity=data.get("space_complexity", "Unknown"),
            resource_impact=data.get("resource_impact", "Low"),
            suggested_challenges=json.dumps(data.get("suggested_challenges", []))
        )
        db.add(analysis)
        db.commit()
        
        return ReviewResponse(**data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
