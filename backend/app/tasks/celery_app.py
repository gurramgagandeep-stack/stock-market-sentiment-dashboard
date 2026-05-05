from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "sentiment_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.jobs"],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "refresh-prices": {
            "task": "app.tasks.jobs.refresh_all_prices",
            "schedule": 30.0,
        },
        "generate-sentiment": {
            "task": "app.tasks.jobs.generate_sentiment_feed",
            "schedule": 15.0,
        },
    },
)
