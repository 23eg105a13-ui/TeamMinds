from fastapi import APIRouter, HTTPException, Depends
from models import CodeRequest, RewriteResponse, Analysis
from database import get_db
from sqlalchemy.orm import Session
import os
from openai import OpenAI
import json

rewrite_router = APIRouter()

@rewrite_router.post("")
async def rewrite_code(request: CodeRequest, db: Session = Depends(get_db)):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable not set.")

    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    Rewrite and optimize the following {request.language} code.
    Fix bugs, improve performance, and follow best practices.
    
    Code:
    ```{request.language}
    {request.code}
    ```
    
    Provide the output in strict JSON format with the following keys:
    - rewritten_code: string
    - explanation: string
    - performance_gain: string (e.g. "+25%")
    - confidence_score: float (0-1)
    
    Do not include any text outside the JSON object.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="gpt-4o",
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        
        result_json = chat_completion.choices[0].message.content
        data = json.loads(result_json)
        
        # Save to DB
        db_analysis = Analysis(
            code=request.code,
            language=request.language,
            analysis_type="Rewrite",
            result_json=result_json,
            summary=data.get("explanation", ""),
            confidence_score=data.get("confidence_score", 0.0),
            performance_score=0.7 # Mock placeholder for specific score
        )
        db.add(db_analysis)
        db.commit()
            
        return RewriteResponse(**data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
