import requests
from django.shortcuts import render


# 🔥 Function: GitHub से files fetch (with recursion + limit)
def get_files_from_repo(api_url, limit=5):
    files_data = []

    try:
        response = requests.get(api_url)
        data = response.json()

        # अगर error आया (rate limit / wrong repo)
        if isinstance(data, dict):
            return files_data

        for item in data:
            # limit control (speed के लिए)
            if len(files_data) >= limit:
                break

            # ✅ file case
            if item['type'] == 'file' and item['name'].endswith(('.py', '.js', '.html', '.css')):
                file_res = requests.get(item['download_url'])

                files_data.append({
                    'name': item['name'],
                    'content': file_res.text[:500]  # सिर्फ 500 chars
                })

            # ✅ folder case (recursion)
            elif item['type'] == 'dir':
                files_data.extend(get_files_from_repo(item['url'], limit))

    except Exception as e:
        print("Error:", e)

    return files_data[:limit]


# 🚀 Main view
def index(request):
    if request.method == 'POST':
        repo_url = request.POST.get('repo_url')

        try:
            # repo URL से owner और repo name निकालना
            parts = repo_url.strip('/').split('/')
            owner = parts[-2]
            repo = parts[-1]

            # GitHub API URL
            api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"

            # files fetch
            files_data = get_files_from_repo(api_url)

            # अगर कोई file नहीं मिली
            if not files_data:
                return render(request, 'index.html', {
                    'error': "No code files found in this repository"
                })

            return render(request, 'index.html', {
                'files': files_data
            })

        except Exception as e:
            return render(request, 'index.html', {
                'error': str(e)
            })

    return render(request, 'index.html')
    return render(request, 'index.html')
import requests
from django.http import JsonResponse

# 🔹 Fetch GitHub repos
def get_github_data(username):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)
    return response.json()

# 🔹 Calculate score
def calculate_score(repos):
    score = 0
    total_repos = len(repos)

    # Repo count scoring
    if total_repos > 5:
        score += 20
    elif total_repos > 2:
        score += 10

    # README / description scoring
    for repo in repos:
        if repo.get("description"):
            score += 2

    # Language diversity
    languages = set()
    for repo in repos:
        if repo.get("language"):
            languages.add(repo["language"])

    if len(languages) > 3:
        score += 20
    elif len(languages) > 1:
        score += 10

    return min(score, 100)

# 🔹 Final API
def skill_score(request):
    username = request.GET.get('username')

    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    repos = get_github_data(username)

    # Error handling
    if isinstance(repos, dict) and repos.get("message"):
        return JsonResponse({"error": "Invalid GitHub username"}, status=400)

    score = calculate_score(repos)

    # Level logic
    if score > 80:
        level = "Advanced"
    elif score > 60:
        level = "Intermediate"
    else:
        level = "Beginner"

    return JsonResponse({
        "username": username,
        "score": score,
        "level": level,
        "confidence": "Based on real GitHub activity"
    })


from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def register_user(request):
    data = request.data

    if User.objects.filter(username=data['username']).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )

    return Response({"message": "User created successfully"})