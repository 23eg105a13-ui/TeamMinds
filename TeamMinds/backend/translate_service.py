from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai

translate_router = APIRouter()

class TranslationRequest(BaseModel):
    code: str
    from_lang: str
    to_lang: str

@translate_router.post("")
async def translate_code(request: TranslationRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = f"""
    Translate the following code from {request.from_lang} to {request.to_lang}.
    Provide ONLY the translated code. No explanations or wrapping.
    
    Code:
    {request.code}
    """

    try:
        response = model.generate_content(prompt)
        translated_code = response.text.strip()
        
        # Clean markdown if LLM includes it
        if translated_code.startswith("```"):
            lines = translated_code.split("\n")
            if len(lines) > 2:
                translated_code = "\n".join(lines[1:-1])
            else:
                translated_code = ""
            
        return {"translated_code": translated_code}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
