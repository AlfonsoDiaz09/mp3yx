import os
import sys
from dotenv import load_dotenv
from django.core.management import execute_from_command_line

def base_path():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = base_path()

# cargar variables
ENV_PATH = os.path.join(BASE_DIR, ".env.dev")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

sys.argv = ["manage.py", "runserver", "127.0.0.1:8000"]
execute_from_command_line(sys.argv)
