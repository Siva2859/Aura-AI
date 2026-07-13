"""
=====================================================
Aura AI Chatbot - Configuration File
=====================================================
Stores all application settings in one place.
=====================================================
"""

import os

from dotenv import load_dotenv

load_dotenv()

# =====================================================
# APP SETTINGS
# =====================================================

APP_NAME = "Aura AI"
APP_VERSION = "1.0.0"

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change_this_to_a_random_secret_key"
)

DEBUG = os.getenv("DEBUG", "True") == "True"

HOST = os.getenv("HOST", "127.0.0.1")

PORT = int(os.getenv("PORT", 5000))


# =====================================================
# DATABASE
# =====================================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_FOLDER = os.path.join(BASE_DIR, "database")

DATABASE_NAME = "chatbot.db"

DATABASE_PATH = os.path.join(
    DATABASE_FOLDER,
    DATABASE_NAME
)


# =====================================================
# UPLOADS
# =====================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "static",
    "uploads"
)

MAX_CONTENT_LENGTH = 25 * 1024 * 1024      # 25 MB


# =====================================================
# ALLOWED FILE TYPES
# =====================================================

ALLOWED_EXTENSIONS = {

    "pdf",

    "docx",

    "txt",

    "csv",

    "png",

    "jpg",

    "jpeg",

    "gif",

    "webp",
    
    "bmp",
    
    "svg"

}


# =====================================================
# AI SETTINGS
# =====================================================

# Groq API Key
# Replace with your own key later

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")


DEFAULT_MODEL = "llama-3.3-70b-versatile"

TEMPERATURE = 0.7

MAX_TOKENS = 2048

TOP_P = 1

STREAM = False


# =====================================================
# CHAT SETTINGS
# =====================================================

MAX_CHAT_HISTORY = 100

AUTO_CHAT_TITLE = True

DEFAULT_CHAT_TITLE = "New Chat"


# =====================================================
# UI SETTINGS
# =====================================================

DEFAULT_THEME = "dark"

ENABLE_MARKDOWN = True

ENABLE_CODE_HIGHLIGHT = True

ENABLE_TYPING_ANIMATION = True

ENABLE_COPY_BUTTON = True

ENABLE_EXPORT = True


# =====================================================
# LOGGING
# =====================================================

LOG_LEVEL = "INFO"


# =====================================================
# CREATE REQUIRED FOLDERS
# =====================================================

os.makedirs(
    DATABASE_FOLDER,
    exist_ok=True
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)