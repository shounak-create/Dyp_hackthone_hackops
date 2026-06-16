import os
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from .models import CustomUser, UserAnalysis
from .serialize import UserSerializer, UserAnalysisSerializer

load_dotenv()

# Setup Groq Client
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

@api_view(['POST'])
def generate_career_audit(request):
    github_username = request.data.get('username')

    if not github_username:
        return Response({"error": "Username is required"}, status=400)

    try:
        # Setup Headers for GitHub PAT to avoid Rate Limits (Hackathon Lifesaver)
        headers = {}
        github_pat = os.environ.get("GITHUB_PAT")
        if github_pat:
            headers["Authorization"] = f"token {github_pat}"

        # 1. Fetch User Profile Data (Bio, Followers, etc.)
        profile_url = f"https://api.github.com/users/{github_username}"
        profile_response = requests.get(profile_url, headers=headers)
        
        if profile_response.status_code != 200:
            print("[ERROR] GITHUB API ERROR:", profile_response.text)
            return Response({"error": f"GitHub user not found or rate limited. Code: {profile_response.status_code}"}, status=404)
            
        profile_data = profile_response.json()
        print("GITHUB RAW DATA:", profile_data) # <--- ADD THIS
        print("Hellow YASH PANCHAL!")
        bio = profile_data.get("bio", "No bio provided")
        followers = profile_data.get("followers", 0)
        public_repos = profile_data.get("public_repos", 0)

        # 2. Fetch Repositories Data
        repos_url = f"https://api.github.com/users/{github_username}/repos"
        params = {"sort": "stars", "per_page": 6}
        repos_response = requests.get(repos_url, headers=headers, params=params)

        if repos_response.status_code != 200:
            return Response({"error": "Failed to fetch GitHub repositories."}, status=404)

        repos_data = repos_response.json()
        
        formatted_repos = []
        for repo in repos_data:
            formatted_repos.append(
                f"{repo['name']} ({repo.get('language', 'Unknown')}) - ⭐ {repo.get('stargazers_count', 0)}: {repo.get('description', '')}"
            )

        repos_text = "\n".join(formatted_repos)

        # 3. Build the AI Prompt with Profile + Repos
        system_prompt = """
        You are a brutally honest senior technical recruiter.
        Analyze the developer based ONLY on the provided GitHub profile and repositories.

        Output JSON with EXACTLY these keys:
        - github_username
        - estimated_level
        - brutal_summary
        - skill_gaps (list)
        - roadmap_90_days (list of objects with 'month' and 'focus')
        """

        user_prompt = f"""
        GitHub Username: {github_username}
        Bio: {bio}
        Followers: {followers}
        Total Public Repos: {public_repos}

        Top Repositories:
        {repos_text}

        Perform a strict technical evaluation.
        """

        # 4. Call Groq (Fixed the model name here!)
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b", 
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        audit_result = json.loads(completion.choices[0].message.content)
        return Response(audit_result)

    except Exception as e:
        print("[ERROR] SERVER ERROR:", str(e))
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