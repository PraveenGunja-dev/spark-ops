"""
Application configuration using Pydantic Settings
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Spark-Ops Control Plane"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL connection URL")
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_DB: int = 1
    REDIS_QUEUE_DB: int = 2

    # Security
    SECRET_KEY: str = Field(..., min_length=32, description="Secret key for JWT")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    API_KEY_SECRET: str = Field(..., description="Secret for API keys")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Rate Limiting
    ENABLE_RATE_LIMITING: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/2"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/3"

    # LangWatch
    LANGWATCH_API_KEY: str = ""
    LANGWATCH_ENDPOINT: str = "https://api.langwatch.ai"
    LANGWATCH_PROJECT_ID: str = ""

    # AWS (Optional)
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = ""

    # Monitoring
    PROMETHEUS_PORT: int = 9090
    ENABLE_METRICS: bool = True
    LOG_LEVEL: str = "INFO"

    # Agent Runtime
    AGENT_MAX_CONCURRENT: int = 100
    AGENT_TIMEOUT_SECONDS: int = 300
    AGENT_RETRY_ATTEMPTS: int = 3

    # Workflow
    WORKFLOW_MAX_STEPS: int = 1000
    WORKFLOW_TIMEOUT_SECONDS: int = 3600

    # Budget
    BUDGET_CHECK_INTERVAL_SECONDS: int = 60
    BUDGET_ALERT_THRESHOLD: float = 0.8

    # Email (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@sparkops.ai"

    # Webhooks
    WEBHOOK_TIMEOUT_SECONDS: int = 30
    WEBHOOK_RETRY_ATTEMPTS: int = 3

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 100
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".json", ".yaml", ".yml", ".txt"]

    # Feature Flags
    ENABLE_WEBHOOKS: bool = True
    ENABLE_SCHEDULES: bool = True
    ENABLE_POLICIES: bool = True
    ENABLE_BUDGETS: bool = True

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
