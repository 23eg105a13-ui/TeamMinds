from fastapi import APIRouter, HTTPException
from models import GitHubRequest, GitHubAnalysisResponse
import httpx
import os
import random
import json
from openai import OpenAI
import base64

github_router = APIRouter()

@github_router.post("/analyze", response_model=GitHubAnalysisResponse)
async def analyze_github(request: GitHubRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    
    import re
    # Match owner and repo from various GitHub URL formats
    match = re.search(r"github\.com/([^/]+)/([^/]+)", request.repo_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL. Must contain owner/repo.")
        
    owner, repo = match.group(1), match.group(2)
    contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    
    headers = {
        "User-Agent": "FastAPI-App"
    }
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    
    async with httpx.AsyncClient() as client:
        # Fetch contents
        resp = await client.get(contents_url, headers=headers)
        if resp.status_code != 200:
             raise HTTPException(status_code=resp.status_code, detail="Failed to fetch repository contents. Ensure it is a public repository.")
        
        data = resp.json()
        file_list = [item["name"] for item in data]
        
        # Fetch README
        readme_content = ""
        readme_resp = await client.get(readme_url, headers=headers)
        if readme_resp.status_code == 200:
            readme_data = readme_resp.json()
            if "content" in readme_data:
                readme_content = base64.b64decode(readme_data["content"]).decode("utf-8")
        
        # LLM Analysis
        openai_client = OpenAI(api_key=api_key)
        
        prompt = f"""
        Analyze this GitHub repository: {request.repo_url}
        
        Project Name: {repo}
        Top-level files: {', '.join(file_list)}
        
        README Content (first 2000 chars):
        {readme_content[:2000]}
        
        Provide a detailed JSON response with these keys:
        - health_score: int (0-100)
        - security_score: int (0-100)
        - performance_score: int (0-100)
        - maintainability_score: int (0-100)
        - summary: string (Brief overview of the project)
        - code_analysis: string (Detailed technical analysis of the project structure and primary tech stack)
        - project_suggestions: [string] (List of 3-5 improvements for the CURRENT code/structure)
        - feature_ideas: [string] (List of 3-5 new features that could be added to this project)
        """
        
        try:
            completion = openai_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="gpt-4o",
                response_format={"type": "json_object"}
            )
            
            analysis_data = json.loads(completion.choices[0].message.content)
            
            return {
                "health": analysis_data.get("health_score", 80),
                "issues": len(file_list) // 2,
                "categories": {
                    "security": analysis_data.get("security_score", 80),
                    "performance": analysis_data.get("performance_score", 80),
                    "maintainability": analysis_data.get("maintainability_score", 80)
                },
                "files": file_list,
                "summary": analysis_data.get("summary", ""),
                "code_analysis": analysis_data.get("code_analysis", ""),
                "project_suggestions": analysis_data.get("project_suggestions", []),
                "feature_ideas": analysis_data.get("feature_ideas", [])
            }
        except Exception as e:
            # Fallback if LLM fails
            return {
                "health": 70,
                "issues": len(file_list) // 3,
                "categories": {
                    "security": 70,
                    "performance": 70,
                    "maintainability": 70
                },
                "files": file_list,
                "summary": f"Analyzed {len(file_list)} files in {repo}. (LLM analysis unavailable)",
                "code_analysis": "Technical analysis could not be generated.",
                "project_suggestions": ["Ensure standard documentation", "Review dependencies"],
                "feature_ideas": ["Add unit tests", "CI/CD integration"]
            }
