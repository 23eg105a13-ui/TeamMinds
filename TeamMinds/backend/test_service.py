from fastapi import APIRouter, HTTPException
from models import CodeRequest
from openai import OpenAI
import os
import json

test_router = APIRouter()

@test_router.post("")
async def generate_tests(request: CodeRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    
    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    Generate 5 comprehensive unit tests for the following {request.language} code.
    Format the output as a JSON object with a 'tests' key.
    Each test should include:
    - name: Descriptive name (e.g., 'Edge Case: Empty Input')
    - description: What it tests
    - platform_suggestion: A specific similar problem from LeetCode, CodeChef, CodingBat, or HackerRank (Name + Link)
    - input: Sample input
    - expected: Expected output
    
    Code:
    {request.code}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
