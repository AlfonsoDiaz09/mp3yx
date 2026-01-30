import json
import shutil
import tempfile
from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .services.downloader import download_mp3
from .services.zip_utils import zip_folder
from pathlib import Path
from django.http import JsonResponse
import uuid
from .tasks import TASKS, download_task
import threading

def index(request):
    return render(request, "music/index.html", {
        "app_version": settings.APP_VERSION
    })

@csrf_exempt
def download_music(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Método no permitido")

    data = json.loads(request.body)
    groups = data.get("groups", [])

    if not groups:
        return HttpResponseBadRequest("No hay groups")

    temp_dir = Path(tempfile.mkdtemp())
    music_dir = temp_dir / "music"

    try:
        for group in groups:
            folder = group["folder"]
            for url in group["links"]:
                download_mp3(url, music_dir / folder)

        zip_path = zip_folder(music_dir)

        response = FileResponse(open(zip_path, "rb"), as_attachment=True, filename="music.zip")
        return response

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@csrf_exempt
def start_download(request):
    data = json.loads(request.body)
    groups = data.get("groups", [])

    task_id = str(uuid.uuid4())

    TASKS[task_id] = {
        "status": "downloading",
        "overall": 0,
        "folders": [],
        "zip_path": None,
    }

    thread = threading.Thread(
        target=download_task,
        args=(task_id, groups),
        daemon=True
    )
    thread.start()

    return JsonResponse({"task_id": task_id})

def download_progress(request):
    task_id = request.GET.get("task_id")

    if task_id not in TASKS:
        return JsonResponse({"error": "task not found"}, status=404)

    return JsonResponse(TASKS[task_id])

def download_file(request):
    task_id = request.GET.get("task_id")
    task = TASKS.get(task_id)

    if not task or task["status"] != "finished":
        return JsonResponse({"error": "file not ready"}, status=400)

    zip_path = Path(task["zip_path"])

    if not zip_path.exists():
        return JsonResponse({"error": "zip not found"}, status=404)

    if zip_path.stat().st_size < 100:
        return JsonResponse({"error": "zip invalid"}, status=500)

    response = FileResponse(open(zip_path, "rb"), as_attachment=True)
    response["Content-Disposition"] = f'attachment; filename="{zip_path.name}"'
    return response
