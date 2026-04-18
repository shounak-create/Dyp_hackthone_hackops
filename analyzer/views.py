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