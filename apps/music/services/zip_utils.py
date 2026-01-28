from pathlib import Path
import zipfile

def zip_folder(folder_path: Path) -> Path:
    zip_path = folder_path.with_suffix(".zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in folder_path.rglob("*"):
            if file.is_file():
                zipf.write(file, file.relative_to(folder_path))

    return zip_path
