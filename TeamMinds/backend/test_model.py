import google.generativeai as genai
import os

api_key = "AIzaSyCKacd5H2Pjp_kDlT89NG1aU1tiStSUGmE"
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.0-flash")
try:
    response = model.generate_content("Hello, say 'Ready'")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
