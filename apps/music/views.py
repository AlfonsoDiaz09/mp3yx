import json
import shutil
import tempfile
from django.http import FileResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .services.downloader import download_mp3
from .services.zip_utils import zip_folder
from pathlib import Path

def index(request):
    return render(request, "music/index.html")

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
