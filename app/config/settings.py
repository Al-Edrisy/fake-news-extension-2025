import os

# Model settings
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-ai/DeepSeek-V3")
HF_TOKEN = os.getenv("HF_TOKEN")

# Database settings
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres@localhost/verinews")

# Logging
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")