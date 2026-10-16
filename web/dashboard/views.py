from django.shortcuts import render


def home(request):
    # All numbers and replays are precomputed JSON in data/web/ (see sim/export_web.py).
    return render(request, "dashboard/index.html", {"page": "console"})


def team(request):
    # Who built Nasaq and the rules we followed; static content.
    return render(request, "dashboard/team.html", {"page": "team"})


def about(request):
    # Explains the system for first-time visitors; static content, no data needed.
    return render(request, "dashboard/about.html", {"page": "about"})
