from celery import Celery
import os

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery_app = Celery("worker", broker=redis_url, backend=redis_url)
celery_app.conf.task_default_queue = "default"

