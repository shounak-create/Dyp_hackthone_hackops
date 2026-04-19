from dotenv import load_dotenv
load_dotenv()
import os
import json
from openai import OpenAI
from rest_framework.decorators import api_view

from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import authenticate
from .models import CustomUser, UserAnalysis
from .serialize import UserSerializer, UserAnalysisSerializer

# NOTE: You must have a .env file in your root directory with: OPENAI_API_KEY=sk-...
client = OpenAI(api_key=os.environ.get("GROQ_API_KEY"),base_url="https://api.groq.com/openai/v1")

# @api_view(['POST'])
# def generate_career_audit(request):
#     github_username = request.data.get('username', 'Unknown User')
    
#     system_prompt = """
#     You are a brutally honest senior technical recruiter. 
#     Output a JSON response with exact keys: 'github_username', 'estimated_level', 'brutal_summary', 'skill_gaps' (list), and 'roadmap_90_days' (list of dicts with 'month' and 'focus').
#     """

#     try:
#         completion = client.chat.completions.create(
#             model="openai/gpt-oss-120b",
#             response_format={ "type": "json_object" },
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": f"Write a brutal code audit for GitHub user: {github_username}"}
#             ]
#         )
        
#         audit_result = json.loads(completion.choices[0].message.content)
#         return Response(audit_result)

#     except Exception as e:
#         return Response({"error": str(e)}, status=500)

import requests
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def generate_career_audit(request):
    github_username = request.data.get('username')

    if not github_username:
        return Response({"error": "Username is required"}, status=400)

    try:

        github_url = f"https://api.github.com/users/{github_username}/repos"

        params = {
            "sort": "stars",
            "per_page": 6
        }

        gh_response = requests.get(github_url, params=params)

        if gh_response.status_code != 200:
            return Response({"error": "GitHub user not found"}, status=404)

        repos_data = gh_response.json()

        
        formatted_repos = []

        for repo in repos_data:
            formatted_repos.append(
                f"{repo['name']} ({repo['language']}) - ⭐ {repo['stargazers_count']}: {repo['description']}"
            )

        repos_text = "\n".join(formatted_repos)

        system_prompt = """
        You are a brutally honest senior technical recruiter.
        Analyze the developer based ONLY on the provided GitHub repositories.

        Output JSON with:
        - github_username
        - estimated_level
        - brutal_summary
        - skill_gaps (list)
        - roadmap_90_days (list of objects with 'month' and 'focus')
        """

        user_prompt = f"""
        GitHub Username: {github_username}

        Repositories:
        {repos_text}

        Perform a strict technical evaluation.
        """

        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        audit_result = json.loads(completion.choices[0].message.content)

        return Response(audit_result)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def signup(request):
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = CustomUser.objects.create_user(
        email=email,
        username=username,
        password=password
    )

    return Response({
        "message": "User created successfully",
        "user": UserSerializer(user).data
    })


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)

    return Response({
        "message": "Login successful",
        "user": UserSerializer(user).data
    })


@api_view(['POST'])
def create_analysis(request):
    user_id = request.data.get('user_id')

    try:
        user = CustomUser.objects.get(id=user_id)
        
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    data = request.data.copy()
    data['user'] = user.id

    serializer = UserAnalysisSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_user_analyses(request, user_id):
    analyses = UserAnalysis.objects.filter(user_id=user_id)

    serializer = UserAnalysisSerializer(analyses, many=True)
    return Response(serializer.data)