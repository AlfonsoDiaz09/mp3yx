from django.urls import path
from .views import index, download_music, start_download, download_progress, download_file

urlpatterns = [
    path("", index, name="music-index"),
    path("download/", download_music, name="music-download"),
    path("download/start/", start_download, name="start_download"),
    path("download/progress/", download_progress),
    path("download/file/", download_file, name="download_file"),
]