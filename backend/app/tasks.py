from app.celery_app import celery_app
from app.etl import process_reel_sync

@celery_app.task(bind=True, max_retries=3)
def process_reel_task(self, payload):
    try:
        process_reel_sync(payload)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

