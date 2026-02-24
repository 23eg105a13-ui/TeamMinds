from fastapi import APIRouter, HTTPException
from models import CodeRequest
import google.generativeai as genai

test_router = APIRouter()

@test_router.post("")
async def generate_tests(request: CodeRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    
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
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
