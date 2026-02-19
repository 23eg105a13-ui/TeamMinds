from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import json

translate_router = APIRouter()

class TranslationRequest(BaseModel):
    code: str
    from_lang: str
    to_lang: str

@translate_router.post("/")
async def translate_code(request: TranslationRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    Translate the following code from {request.from_lang} to {request.to_lang}.
    Provide ONLY the translated code. No explanations or wrapping.
    
    Code:
    {request.code}
    """

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            temperature=0.1
        )
        
        translated_code = completion.choices[0].message.content.strip()
        # Clean markdown if LLM includes it
        if translated_code.startswith("```"):
            translated_code = "\n".join(translated_code.split("\n")[1:-1])
            
        return {"translated_code": translated_code}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
