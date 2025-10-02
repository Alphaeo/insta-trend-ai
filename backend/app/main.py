from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.db import get_db_client
from app.tasks import process_reel_task
import os
from fastapi import APIRouter, Request
from app.payments import verify_payment

router = APIRouter()

app = FastAPI(title="Reels Trend API")

class IngestPayload(BaseModel):
    reel_id: str
    origin: str
    media_url: str
    caption: str = None
    author_id: str = None
    views: int = 0
    likes: int = 0

@app.post("/ingest")
async def ingest(payload: IngestPayload):
    db = get_db_client()
    db.reels.update_one({"_id": payload.reel_id}, {"$set": payload.dict()}, upsert=True)
    # fires celery job
    process_reel_task.delay(payload.dict())
    return {"status": "queued", "reel_id": payload.reel_id}

@app.get("/reel/{reel_id}")
def get_reel(reel_id: str):
    db = get_db_client()
    doc = db.reels.find_one({"_id": reel_id})
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    return doc

@router.post("/payments/iamport/webhook")
async def iamport_webhook(req: Request):
    data = await req.json()
    imp_uid = data.get("imp_uid")
    merchant_uid = data.get("merchant_uid")
    if not imp_uid:
        raise HTTPException(status_code=400, detail="no imp_uid")
    info = verify_payment(imp_uid)
    # update subscription in DB: merchant_uid -> user mapping
    # mark subscription as active if status == 'paid'
    return {"status":"ok"}



