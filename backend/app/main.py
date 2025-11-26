import asyncio
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging
import io

from app.db import get_db_client, store_file_to_minio, get_minio_client
from botocore.exceptions import ClientError
from app.tasks import process_reel_task
from app.payments import verify_payment
from app.apify import run_apify_scraper
from app.ai import generate_content_suggestions
from app.chat import router as chat_router, cleanup_old_messages, init_chat_indexes
from bson import ObjectId
from app.auth import (
    UserCreate, UserLogin, UserResponse, Token, 
    create_user, authenticate_user, create_access_token,
    get_current_active_user, get_current_admin_user
)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reels Trend API")

# Inclure le routeur de chat
app.include_router(chat_router)
# -------- USER PROFILE --------
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    language: Optional[str] = None  # e.g., 'en', 'ru', 'fr'
    timezone: Optional[str] = None
    avatar_url: Optional[str] = None


@app.get("/user/me")
async def get_me(current_user: dict = Depends(get_current_active_user)):
    db = get_db_client()
    doc = db["users"].find_one({"email": current_user["email"]})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    doc["id"] = str(doc.pop("_id"))
    if "password" in doc:
        del doc["password"]
    return doc


@app.put("/user/me")
async def update_me(payload: UserUpdate, current_user: dict = Depends(get_current_active_user)):
    db = get_db_client()
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        return await get_me(current_user)
    updates["updated_at"] = datetime.utcnow()
    res = db["users"].find_one_and_update(
        {"email": current_user["email"]},
        {"$set": updates},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    res["id"] = str(res.pop("_id"))
    if "password" in res:
        del res["password"]
    return res


# -------- CORS --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:80",
        "http://localhost:3000",
        "http://localhost",
        "https://localhost",
        "http://localhost:8000",
        "ws://localhost",
        "wss://localhost",
        "ws://localhost:80",
        "wss://localhost:80"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# -------- MODELS --------
class IngestPayload(BaseModel):
    reel_id: str
    origin: str
    media_url: str
    caption: Optional[str] = None
    author_id: Optional[str] = None
    views: int = 0
    likes: int = 0


# -------- INGEST --------
@app.post("/ingest")
async def ingest(payload: IngestPayload):
    """
    Automatic ingestion (via scraper or API)
    """
    db = get_db_client()
    reels_col = db["reelsdb"]
    reels_col.update_one({"_id": payload.reel_id}, {"$set": payload.dict()}, upsert=True)
    process_reel_task.delay(payload.dict())
    return {"status": "queued", "reel_id": payload.reel_id}


@app.get("/reel/{reel_id}")
def get_reel(reel_id: str):
    db = get_db_client()
    reels_col = db["reelsdb"]
    doc = reels_col.find_one({"_id": reel_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Reel not found")
    doc["_id"] = str(doc["_id"])
    return doc


# -------- PAYMENTS --------
@app.post("/payments/iamport/webhook")
async def iamport_webhook(req: Request):
    data = await req.json()
    imp_uid = data.get("imp_uid")
    merchant_uid = data.get("merchant_uid")
    if not imp_uid:
        raise HTTPException(status_code=400, detail="Missing imp_uid")
    info = verify_payment(imp_uid)
    return {"status": "ok", "payment_info": info}


# -------- SCRAPER --------
@app.get("/scrape/{hashtag}")
async def scrape(hashtag: str):
    """
    Scrape Reels for a hashtag via Apify, store them in MongoDB, and queue Celery tasks.
    """
    try:
        results = run_apify_scraper(hashtag, results_limit=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Apify scraping failed: {e}")

    db = get_db_client()
    reels_col = db["reelsdb"]

    for reel in results:
        reel_id = reel.get("id") or reel.get("url")
        if not reel_id:
            continue
        reels_col.update_one({"_id": reel_id}, {"$set": reel}, upsert=True)
        process_reel_task.delay(reel)

    return {"status": "done", "count": len(results)}


# -------- CONTENT SUGGESTIONS --------
class SuggestPayload(BaseModel):
    prompt: str
    language: str = "fr"
    take_events: int = 5
    take_lessons: int = 5


@app.post("/content/suggest")
async def suggest_content(body: SuggestPayload):
    db = get_db_client()
    events = list(db["events"].find().sort("created_at", -1).limit(body.take_events))
    lessons = list(db["lessons"].find().sort("created_at", -1).limit(body.take_lessons))
    text = generate_content_suggestions(body.prompt, events, lessons, language=body.language)
    return {"suggestions": text}


# -------- ADMIN --------
@app.get("/admin/users")
def list_users(current_user: dict = Depends(get_current_admin_user)):
    """Get list of all users (admin only)"""
    db = get_db_client()
    users_col = db["users"]
    users = list(users_col.find({}, {"password": 0}))  # Exclude password field
    for user in users:
        user["_id"] = str(user["_id"])
    return users


@app.get("/admin/db/overview")
def db_overview(current_user: dict = Depends(get_current_admin_user)):
    """Return collection counts and recent items for admin overview."""
    db = get_db_client()
    collections = db.list_collection_names()
    overview = {}
    for name in collections:
        try:
            col = db[name]
            count = col.estimated_document_count()
            items = list(col.find().sort("_id", -1).limit(10))
            serialized = []
            for it in items:
                it_copy = dict(it)
                if "_id" in it_copy:
                    it_copy["_id"] = str(it_copy["_id"])
                for k, v in list(it_copy.items()):
                    if hasattr(v, "isoformat"):
                        it_copy[k] = v.isoformat()
                serialized.append(it_copy)
            overview[name] = {"count": count, "recent": serialized}
        except Exception:
            overview[name] = {"count": 0, "recent": []}
    return overview


# -------- EVENTS --------
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = "Call"
    tags: List[str] = []
    thumbnail: Optional[str] = None  # MinIO URL or external URL


@app.get("/events")
def list_events(limit: int = 20):
    db = get_db_client()
    items = list(db["events"].find().sort("created_at", -1).limit(limit))
    # Serialize Mongo ObjectId and datetime for JSON response
    serialized = []
    for it in items:
        it_copy = dict(it)
        if "_id" in it_copy:
            it_copy["_id"] = str(it_copy["_id"])
        if "created_at" in it_copy and hasattr(it_copy["created_at"], "isoformat"):
            it_copy["created_at"] = it_copy["created_at"].isoformat()
        serialized.append(it_copy)
    return {"items": serialized}


@app.post("/events")
def create_event(payload: EventCreate, current_user: dict = Depends(get_current_admin_user)):
    db = get_db_client()
    doc = payload.dict()
    doc["created_at"] = datetime.utcnow()
    res = db["events"].insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


@app.delete("/events/{event_id}")
def delete_event(event_id: str, current_user: dict = Depends(get_current_admin_user)):
    db = get_db_client()
    try:
        oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event id")
    result = db["events"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "deleted", "id": event_id}


# -------- EVENT REGISTRATIONS --------
class EventRegistration(BaseModel):
    event_id: str


@app.post("/events/{event_id}/join")
def join_event(event_id: str, current_user: dict = Depends(get_current_active_user)):
    """
    Link the current user to an event (register).
    """
    db = get_db_client()
    try:
        oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event id")

    # Ensure event exists
    event = db["events"].find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Upsert registration
    reg = db["event_registrations"].find_one({
        "user_email": current_user["email"],
        "event_id": str(oid),
    })
    if reg:
        return {"status": "already_registered", "event_id": event_id}

    db["event_registrations"].insert_one({
        "user_email": current_user["email"],
        "user_id": str(current_user.get("_id", "")),
        "event_id": str(oid),
        "created_at": datetime.utcnow(),
    })
    return {"status": "registered", "event_id": event_id}


@app.get("/events/registrations/me")
def my_event_registrations(current_user: dict = Depends(get_current_active_user)):
    """
    List events the current user is registered for.
    """
    db = get_db_client()
    regs = list(db["event_registrations"].find({"user_email": current_user["email"]}))
    event_ids = [ObjectId(r["event_id"]) for r in regs if r.get("event_id")]
    if not event_ids:
        return {"items": []}
    events = list(db["events"].find({"_id": {"$in": event_ids}}))
    items = []
    for ev in events:
        it = dict(ev)
        it["_id"] = str(it["_id"])
        if "created_at" in it and hasattr(it["created_at"], "isoformat"):
            it["created_at"] = it["created_at"].isoformat()
        items.append(it)
    return {"items": items}


@app.delete("/events/{event_id}/leave")
def leave_event(event_id: str, current_user: dict = Depends(get_current_active_user)):
    """
    Unregister the current user from an event.
    """
    db = get_db_client()
    try:
        oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event id")
    
    # Delete the registration
    result = db["event_registrations"].delete_one({
        "user_email": current_user["email"],
        "event_id": str(oid),
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"status": "unregistered", "event_id": event_id}


# -------- LESSONS --------
@app.post("/lessons/upload")
async def upload_lesson(
    file: UploadFile = File(...),
    title: str = Form(...),
    summary: str = Form(""),
    thumbnail: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_admin_user)
):
    db = get_db_client()
    import tempfile, os
    
    tmp_dir = tempfile.mkdtemp()
    local_path = os.path.join(tmp_dir, file.filename)
    with open(local_path, "wb") as f:
        f.write(await file.read())

    key = f"lessons/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    url = store_file_to_minio(local_path, "assets", key)

    thumb_url = None
    
    # If thumbnail is provided, use it
    if thumbnail is not None:
        thumb_local = os.path.join(tmp_dir, f"thumb_{thumbnail.filename}")
        with open(thumb_local, "wb") as tf:
            tf.write(await thumbnail.read())
        thumb_key = f"thumbnails/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{thumbnail.filename}"
        thumb_url = store_file_to_minio(thumb_local, "assets", thumb_key)
    # If no thumbnail provided and file is a PDF, generate one automatically
    elif file.filename and file.filename.lower().endswith('.pdf'):
        try:
            # Try to generate thumbnail from PDF using pdf2image
            from pdf2image import convert_from_path
            pages = convert_from_path(local_path, first_page=1, last_page=1, dpi=200)
            if pages:
                thumb_local = os.path.join(tmp_dir, f"thumb_{file.filename}.jpg")
                pages[0].save(thumb_local, "JPEG", quality=85)
                thumb_key = f"thumbnails/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}.jpg"
                thumb_url = store_file_to_minio(thumb_local, "assets", thumb_key)
                logger.info(f"Generated PDF thumbnail: {thumb_url}")
        except Exception as e:
            logger.warning(f"Could not generate PDF thumbnail: {e}. pdf2image may not be installed or poppler may be missing.")

    doc = {
        "title": title,
        "summary": summary,
        "file": url,
        "created_at": datetime.utcnow(),
    }
    if thumb_url:
        doc["thumbnail"] = thumb_url
    res = db["lessons"].insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


# -------- GENERIC UPLOADS --------
@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_admin_user)):
    """
    Upload an image (e.g., thumbnail) to MinIO and return its URL.
    """
    import tempfile, os
    tmp_dir = tempfile.mkdtemp()
    local_path = os.path.join(tmp_dir, file.filename)
    with open(local_path, "wb") as f:
        f.write(await file.read())
    key = f"thumbnails/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    url = store_file_to_minio(local_path, "assets", key)
    return {"url": url}


@app.get("/lessons")
def list_lessons(limit: int = 50):
    db = get_db_client()
    items = list(db["lessons"].find().sort("created_at", -1).limit(limit))
    # Serialize Mongo ObjectId and datetime for JSON response
    serialized = []
    for it in items:
        it_copy = dict(it)
        if "_id" in it_copy:
            it_copy["_id"] = str(it_copy["_id"])
        if "created_at" in it_copy and hasattr(it_copy["created_at"], "isoformat"):
            it_copy["created_at"] = it_copy["created_at"].isoformat()
        serialized.append(it_copy)
    return {"items": serialized}


@app.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: str):
    """
    Get a single lesson by ID.
    """
    db = get_db_client()
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lesson id")
    
    lesson = db["lessons"].find_one({"_id": oid})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Serialize for JSON response
    lesson["_id"] = str(lesson["_id"])
    if "created_at" in lesson and hasattr(lesson["created_at"], "isoformat"):
        lesson["created_at"] = lesson["created_at"].isoformat()
    
    return lesson


@app.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: str, current_user: dict = Depends(get_current_admin_user)):
    db = get_db_client()
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lesson id")
    result = db["lessons"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"status": "deleted", "id": lesson_id}


# -------- FILE SERVING --------
@app.get("/files/{bucket}/{file_path:path}")
async def serve_file(bucket: str, file_path: str, current_user: dict = Depends(get_current_active_user)):
    """
    Serve files from MinIO storage.
    Requires authentication to access files.
    For PDFs in iframes, we need to return the file directly since iframes can't send auth headers.
    """
    try:
        s3 = get_minio_client()
        # Get the file from MinIO
        obj = s3.get_object(Bucket=bucket, Key=file_path)
        
        # Determine content type based on file extension
        content_type = "application/octet-stream"
        filename = file_path.split("/")[-1]
        if filename.endswith(".pdf"):
            content_type = "application/pdf"
        elif filename.endswith((".jpg", ".jpeg")):
            content_type = "image/jpeg"
        elif filename.endswith(".png"):
            content_type = "image/png"
        elif filename.endswith(".gif"):
            content_type = "image/gif"
        elif filename.endswith((".mp4", ".mov")):
            content_type = "video/mp4"
        elif filename.endswith(".mp3"):
            content_type = "audio/mpeg"
        
        # Stream the file
        def generate():
            body = obj['Body']
            try:
                while True:
                    chunk = body.read(1024 * 1024)  # Read 1MB chunks
                    if not chunk:
                        break
                    yield chunk
            finally:
                body.close()
        
        return StreamingResponse(
            generate(),
            media_type=content_type,
            headers={
                "Content-Disposition": f'inline; filename="{filename}"',
                "Cache-Control": "public, max-age=3600",
                "X-Content-Type-Options": "nosniff",
            }
        )
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', '')
        if error_code == 'NoSuchKey':
            logger.error(f"File not found: {bucket}/{file_path}")
            raise HTTPException(status_code=404, detail="File not found")
        else:
            logger.error(f"Error serving file {bucket}/{file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")
    except Exception as e:
        logger.error(f"Error serving file {bucket}/{file_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


# -------- SAVED REELS --------
class SavedReelCreate(BaseModel):
    reel_id: str
    platform: str
    location: str
    niche: str
    media_url: str
    caption: Optional[str] = None
    views: int = 0
    likes: int = 0
    embed_html: Optional[str] = None

@app.post("/user/saved-reels")
async def save_reel(
    reel_data: SavedReelCreate, 
    current_user: dict = Depends(get_current_active_user)
):
    """
    Save a reel to the user's dashboard.
    """
    db = get_db_client()
    
    # Check if already saved
    existing = db.saved_reels.find_one({
        "user_id": current_user["id"],
        "reel_id": reel_data.reel_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Reel already saved")
    
    # Save the reel
    saved_reel = {
        "user_id": current_user["id"],
        "reel_id": reel_data.reel_id,
        "platform": reel_data.platform,
        "location": reel_data.location,
        "niche": reel_data.niche,
        "media_url": reel_data.media_url,
        "caption": reel_data.caption,
        "views": reel_data.views,
        "likes": reel_data.likes,
        "embed_html": reel_data.embed_html,
        "saved_at": datetime.utcnow()
    }
    
    result = db.saved_reels.insert_one(saved_reel)
    saved_reel["id"] = str(result.inserted_id)
    
    return saved_reel

@app.delete("/user/saved-reels/{reel_id}")
async def unsave_reel(
    reel_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Remove a reel from the user's saved reels.
    """
    db = get_db_client()
    
    result = db.saved_reels.delete_one({
        "user_id": current_user["id"],
        "reel_id": reel_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved reel not found")
    
    return {"status": "success", "message": "Reel removed from saved"}

@app.get("/user/saved-reels")
async def get_saved_reels(
    current_user: dict = Depends(get_current_active_user),
    limit: int = 50,
    skip: int = 0
):
    """
    Get the current user's saved reels.
    """
    db = get_db_client()
    
    # Get saved reels for the current user
    saved_reels = list(db.saved_reels
        .find({"user_id": current_user["id"]})
        .sort("saved_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Convert ObjectId to string for JSON serialization
    for reel in saved_reels:
        reel["id"] = str(reel["_id"])
        del reel["_id"]
    
    total = db.saved_reels.count_documents({"user_id": current_user["id"]})
    
    return {
        "items": saved_reels,
        "total": total,
        "has_more": (skip + len(saved_reels)) < total
    }

# -------- TRENDS --------
@app.get("/trends/top")
def top_reels(limit: int = 20, platform: Optional[str] = None, 
              location: Optional[str] = None, niche: Optional[str] = None):
    """
    Retrieve top reels for the trends page with optional filters.
    
    Args:
        limit: Maximum number of reels to return
        platform: Filter by platform (e.g., 'Instagram', 'TikTok')
        location: Filter by location (e.g., 'USA', 'Korea')
        niche: Filter by niche/category (e.g., 'Beauty', 'Sports')
    """
    db = get_db_client()
    reels_col = db["reelsdb"]
    
    # Build query filters
    query = {}
    if platform:
        query["platform"] = platform
    if location:
        query["location"] = location
    if niche and niche.lower() != 'all':
        query["niche"] = niche
    
    # Get total count for pagination info
    total_count = reels_col.count_documents(query)
    
    # Fetch reels with sorting and limit
    items = list(reels_col.find(query)
                       .sort([("views", -1), ("likes", -1)])
                       .limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for r in items:
        r["_id"] = str(r["_id"])
    
    return {
        "items": items,
        "total": total_count,
        "has_more": len(items) < total_count
    }


class ManualReel(BaseModel):
    reel_id: str
    media_url: str
    caption: Optional[str] = None
    views: int = 0
    likes: int = 0
    embed_html: Optional[str] = None  # NEW FIELD
    platform: Optional[str] = None
    location: Optional[str] = None
    niche: Optional[str] = None


@app.post("/trends/manual-ingest")
def manual_ingest(payload: ManualReel, current_user: dict = Depends(get_current_admin_user)):
    """
    Manually add a reel (admin panel upload form).
    """
    db = get_db_client()
    reels_col = db["reelsdb"]

    doc = {
        "_id": payload.reel_id,
        "reel_id": payload.reel_id,
        "origin": "manual",
        "media_url": payload.media_url,
        "caption": payload.caption,
        "views": payload.views,
        "likes": payload.likes,
        "embed_html": payload.embed_html,
        "platform": payload.platform,
        "location": payload.location,
        "niche": payload.niche,
        "created_at": datetime.utcnow(),
    }

    reels_col.update_one({"_id": payload.reel_id}, {"$set": doc}, upsert=True)
    process_reel_task.delay(doc)
    return {"status": "queued", "reel_id": payload.reel_id}


# -------- DRAFTS (per-user, limit 5) --------
class DraftCreate(BaseModel):
    title: str
    content: str
    agent_id: Optional[str] = None


@app.get("/drafts")
def list_drafts(current_user: dict = Depends(get_current_active_user)):
    db = get_db_client()
    items = list(db["drafts"].find({"user_id": current_user["id"]}).sort("updated_at", -1))
    for it in items:
        it["_id"] = str(it["_id"])
        if "created_at" in it and hasattr(it["created_at"], "isoformat"):
            it["created_at"] = it["created_at"].isoformat()
        if "updated_at" in it and hasattr(it["updated_at"], "isoformat"):
            it["updated_at"] = it["updated_at"].isoformat()
    return {"items": items}


@app.post("/drafts")
def create_draft(payload: DraftCreate, current_user: dict = Depends(get_current_active_user)):
    db = get_db_client()
    col = db["drafts"]
    count = col.count_documents({"user_id": current_user["id"]})
    if count >= 5:
        raise HTTPException(status_code=400, detail="Draft limit reached (5)")
    now = datetime.utcnow()
    doc = {
        "user_id": current_user["id"],
        "title": payload.title,
        "content": payload.content,
        "agent_id": payload.agent_id,
        "created_at": now,
        "updated_at": now,
    }
    res = col.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


@app.delete("/drafts/{draft_id}")
def delete_draft(draft_id: str, current_user: dict = Depends(get_current_active_user)):
    db = get_db_client()
    try:
        oid = ObjectId(draft_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid draft id")
    res = db["drafts"].delete_one({"_id": oid, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"status": "deleted", "id": draft_id}

# Tâche de fond pour le nettoyage périodique des messages
@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage de l'application"""
    # Initialiser les index MongoDB pour le chat
    await init_chat_indexes()
    
    # Démarrer la tâche de nettoyage périodique
    async def periodic_cleanup():
        while True:
            try:
                await asyncio.sleep(3600)  # Toutes les heures
                logger.info("Running periodic chat messages cleanup...")
                await cleanup_old_messages(max_messages=200)
            except Exception as e:
                logger.error(f"Error in periodic cleanup: {e}")
                await asyncio.sleep(60)  # Attendre 1 minute en cas d'erreur
    
    # Démarrer la tâche en arrière-plan
    asyncio.create_task(periodic_cleanup())
    logger.info("Background tasks started")

# -------- CONTACT FORM --------
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    budget: str
    message: str
    subject: str
    to: str

@app.post("/contact")
async def send_contact_email(contact: ContactForm):
    """
    Handle contact form submission and send email
    """
    try:
        # Log the contact request (you can replace this with actual email sending logic)
        logger.info(f"New contact form submission from {contact.name} <{contact.email}>")
        logger.info(f"Subject: {contact.subject}")
        logger.info(f"Message: {contact.message}")
        logger.info(f"Budget: {contact.budget}")
        
        # Here you would typically integrate with an email service like SendGrid, Mailgun, etc.
        # Example with SendGrid (uncomment and configure as needed):
        # import sendgrid
        # from sendgrid.helpers.mail import Mail, Content
        # import os
        # 
        # sg = sendgrid.SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
        # 
        # message = Mail(
        #     from_email=contact.email,
        #     to_emails=contact.to,
        #     subject=contact.subject,
        #     html_content=f"""
        #         <h2>New Contact Form Submission</h2>
        #         <p><strong>Name:</strong> {contact.name}</p>
        #         <p><strong>Email:</strong> {contact.email}</p>
        #         <p><strong>Company:</strong> {contact.company or 'N/A'}</p>
        #         <p><strong>Budget:</strong> {contact.budget}</p>
        #         <h3>Message:</h3>
        #         <p>{contact.message}</p>
        #     """
        # )
        # 
        # response = sg.send(message)
        # if response.status_code != 202:
        #     logger.error(f"Failed to send email: {response.body}")
        #     raise HTTPException(status_code=500, detail="Failed to send email")
        
        return {"status": "success", "message": "Contact form submitted successfully"}
        
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process contact form")

# -------- AUTH --------
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    try:
        user = create_user(user_data)
        return UserResponse(**user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login a user and return access token."""
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current user information."""
    return UserResponse(**current_user)


@app.get("/auth/admin-only")
async def admin_only_endpoint(current_user: dict = Depends(get_current_admin_user)):
    """Admin only endpoint example."""
    return {"message": f"Hello admin {current_user['full_name']}!"}


