import shutil

def zip_folder(folder_path: str) -> str:
    zip_path = folder_path.with_suffix(".zip")
    shutil.make_archive(folder_path, 'zip', folder_path)
    return zip_path
