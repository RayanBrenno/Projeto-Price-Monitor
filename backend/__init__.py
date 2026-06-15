import os

from dotenv import load_dotenv

# Centralized so CORS_ORIGINS (main.py) and TELEGRAM_* (scraper.py) are
# available regardless of entrypoint (uvicorn backend.main:app, python -m backend.scraper)
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
