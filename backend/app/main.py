from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.tasks import enqueue_reel_processing
from app.db import get_db_client

app = FastAPI(title="Reels Trend API")

class IngestPayload(BaseModel):
    reel_id: str
    origin: str
    media_url: str
    caption: str = None
    author_id: str = None

@app.post("/ingest")
async def ingest(payload: IngestPayload):
    # persist minimal metadata -> Mongo
    db = get_db_client()
    db.reels.update_one({"id": payload.reel_id}, {"$set": payload.dict()}, upsert=True)
    enqueue_reel_processing.delay(payload.dict())
    return {"status":"queued"}

