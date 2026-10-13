import os
from dotenv import load_dotenv
# Load .env file from the same directory as config.py or fallback to current directory
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()

class Settings:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "")

    AUTH_USERNAME = os.getenv("AUTH_USERNAME", "admin")
    AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "admin")

    # Brevo (Sendinblue) transactional email / SMTP
    BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
    BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@btrustbank.lk")
    BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "B-Trust Digital Banking")
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp-relay.brevo.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_LOGIN = os.getenv("SMTP_LOGIN", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


settings = Settings()