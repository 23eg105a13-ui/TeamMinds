import google.generativeai as genai
import os

api_key = "AIzaSyCKacd5H2Pjp_kDlT89NG1aU1tiStSUGmE"
genai.configure(api_key=api_key)

with open("models_list.txt", "w") as f:
    f.write("Available models:\n")
    for m in genai.list_models():
        f.write(f"- {m.name} (Methods: {m.supported_generation_methods})\n")
print("Done writing to models_list.txt")
