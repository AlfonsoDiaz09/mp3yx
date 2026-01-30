import logging
import os
import yt_dlp

from django.conf import settings

logger = logging.getLogger("music")

def download_mp3(url: str, base_path: str):
    os.makedirs(base_path, exist_ok=True)

    logger.info(f"Descargando | {url}")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(base_path, "%(uploader)s/%(title)s.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
        "noplaylist": True,
        "quiet": settings.YTDLP_QUIET,
        "extractor_args": {
            "youtube": {
                "player_client": ["android"]
            }
        },
        "http_headers": {
            "User-Agent": "Mozilla/5.0"
        },

        "js_runtimes": {
            "node": {}
        },
        "retries": 3,
        "fragment_retries": 3,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)

    except Exception:
        logger.error("Error yt-dlp", exc_info=True)
        raise
