from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://sentiment_user:sentiment_pass@localhost:5432/sentiment_db"
    redis_url: str = "redis://localhost:6379"
    polygon_api_key: str = "demo"
    twitter_bearer_token: str = "demo"
    reddit_client_id: str = "demo"
    reddit_client_secret: str = "demo"
    secret_key: str = "supersecretkey123"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
