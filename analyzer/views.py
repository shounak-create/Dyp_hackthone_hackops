import requests
from django.shortcuts import render
from django.http import JsonResponse


# 🔥 Fetch files from repo
def get_files_from_repo(api_url, limit=5):
    files_data = []

    try:
        response = requests.get(api_url)
        data = response.json()

        if isinstance(data, dict):
            return files_data

        for item in data:
            if len(files_data) >= limit:
                break

            if item['type'] == 'file' and item['name'].endswith(('.py', '.js', '.html', '.css')):
                file_res = requests.get(item['download_url'])

                files_data.append({
                    'name': item['name'],
                    'content': file_res.text[:500]
                })

            elif item['type'] == 'dir':
                files_data.extend(get_files_from_repo(item['url'], limit))

    except Exception as e:
        print("Error:", e)

    return files_data[:limit]


# 🚀 Home page
def index(request):
    if request.method == 'POST':
        repo_url = request.POST.get('repo_url')

        try:
            parts = repo_url.strip('/').split('/')
            owner = parts[-2]
            repo = parts[-1]

            api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"

            files_data = get_files_from_repo(api_url)

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


# 🔹 GitHub Repo Data
def get_github_data(username):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)
    return response.json()


# 🔹 Score Calculation
def calculate_score(repos):
    score = 0
    total_repos = len(repos)

    if total_repos > 5:
        score += 20
    elif total_repos > 2:
        score += 10

    for repo in repos:
        if repo.get("description"):
            score += 2

    languages = set()
    for repo in repos:
        if repo.get("language"):
            languages.add(repo["language"])

    if len(languages) > 3:
        score += 20
    elif len(languages) > 1:
        score += 10

    return min(score, 100)


# 🔹 Skill Score API
def skill_score(request):
    username = request.GET.get('username')

    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    repos = get_github_data(username)

    if isinstance(repos, dict) and repos.get("message"):
        return JsonResponse({"error": "Invalid GitHub username"}, status=400)

    score = calculate_score(repos)

    if score > 80:
        level = "Advanced"
        feedback = "Strong profile. Focus on scalability and optimization."
    elif score > 60:
        level = "Intermediate"
        feedback = "Good skills, but need backend depth and advanced projects."
    else:
        level = "Beginner"
        feedback = "You need more projects and better documentation."

    return JsonResponse({
        "username": username,
        "score": score,
        "level": level,
        "feedback": feedback
    })


# 🔹 Resume vs Reality
def compare_skills(request):
    username = request.GET.get('username')
    skills_input = request.GET.get('skills')

    if not username or not skills_input:
        return JsonResponse({"error": "Username and skills required"}, status=400)

    claimed_skills = [s.strip().lower() for s in skills_input.split(',')]

    repos = get_github_data(username)

    if isinstance(repos, dict) and repos.get("message"):
        return JsonResponse({"error": "Invalid GitHub username"}, status=400)

    github_skills = set()
    for repo in repos:
        if repo.get("language"):
            github_skills.add(repo["language"].lower())

    matched = []
    missing = []

    for skill in claimed_skills:
        if skill in github_skills:
            matched.append(skill)
        else:
            missing.append(skill)

    if missing:
        message = f"You claim {', '.join(missing)} but no supporting projects found."
    else:
        message = "Your skills match your GitHub profile."

    return JsonResponse({
        "username": username,
        "matched": matched,
        "missing": missing,
        "message": message
    })