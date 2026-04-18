from dotenv import load_dotenv
load_dotenv()
import os
import json
from openai import OpenAI
from rest_framework.decorators import api_view
from rest_framework.response import Response

# NOTE: You must have a .env file in your root directory with: OPENAI_API_KEY=sk-...
client = OpenAI(api_key=os.environ.get("GROQ_API_KEY"),base_url="https://api.groq.com/openai/v1")

@api_view(['POST'])
def generate_career_audit(request):
    github_username = request.data.get('username', 'Unknown User')
    
    system_prompt = """
    You are a brutally honest senior technical recruiter. 
    Output a JSON response with exact keys: 'github_username', 'estimated_level', 'brutal_summary', 'skill_gaps' (list), and 'roadmap_90_days' (list of dicts with 'month' and 'focus').
    """

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Write a brutal code audit for GitHub user: {github_username}"}
            ]
        )
        
        audit_result = json.loads(completion.choices[0].message.content)
        return Response(audit_result)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
