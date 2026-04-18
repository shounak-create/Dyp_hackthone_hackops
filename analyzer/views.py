from django.shortcuts import render

def index(request):
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