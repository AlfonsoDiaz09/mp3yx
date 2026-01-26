from django.urls import path
from .views import index, download_music

urlpatterns = [
    path("", index, name="music-index"),
    path("download/", download_music, name="music-download"),
]