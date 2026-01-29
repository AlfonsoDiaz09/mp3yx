import tempfile
import time
import zipfile
import os
import threading
from .services.downloader import download_mp3
from .services.zip_utils import zip_folder
from pathlib import Path

TASKS = {}


def download_task(task_id, groups):
    try:
        TASKS[task_id]["folders"] = []

        total_links = sum(len(g["links"]) for g in groups)
        done = 0

        # base_dir = f"/tmp/{task_id}"
        temp_dir = Path(tempfile.mkdtemp())
        music_dir = temp_dir / "music" / task_id
        os.makedirs(music_dir, exist_ok=True)

        for group in groups:
            folder = group["folder"]
            folder_path = music_dir / folder
            folder_path.mkdir(parents=True, exist_ok=True)

            folder_progress = {
                "name": folder,
                "progress": 0
            }
            TASKS[task_id]["folders"].append(folder_progress)

            for link in group["links"]:
                success = False
                try:
                    download_mp3(link, folder_path)
                    success = True
                except Exception as e:
                    print("❌ Error descargando:", link, e)

                if success:
                    done += 1

                folder_progress["progress"] = int(
                    (done / total_links) * 100
                )
                TASKS[task_id]["overall"] = folder_progress["progress"]

        if done == 0:
            TASKS[task_id].update({
                "status": "error",
                "error": "No se pudo descargar ningún archivo",
            })
            return


        zip_path = zip_folder(music_dir)
        zip_path = zip_path.resolve()

        if zip_path.stat().st_size < 1024:
            TASKS[task_id].update({
                "status": "error",
                "error": "ZIP vacío o inválido",
            })
            return

        TASKS[task_id].update({
            "status": "finished",
            "zip_path": str(zip_path),
            "overall": 100,
        })
    except Exception as e:
        TASKS[task_id]["status"] = "error"
        TASKS[task_id]["error"] = str(e)
