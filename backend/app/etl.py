import os, requests, tempfile, subprocess
from app.db import get_db_client, store_file_to_minio
from datetime import datetime

def download_file(url, dest):
    r = requests.get(url, stream=True, timeout=30)
    r.raise_for_status()
    with open(dest, "wb") as f:
        for chunk in r.iter_content(1024*1024):
            f.write(chunk)
    return dest

def process_reel_sync(payload: dict):
    reel_id = payload.get("reel_id")
    media_url = payload.get("media_url")
    tmp_dir = tempfile.mkdtemp()
    video_path = os.path.join(tmp_dir, f"{reel_id}.mp4")

    # Download
    download_file(media_url, video_path)

    # Upload to MinIO (bucket 'reels', key reel_id.mp4)
    video_key = f"{reel_id}.mp4"
    store_file_to_minio(video_path, "reels", video_key)

    # Create thumbnail via ffmpeg (1s)
    thumb_path = os.path.join(tmp_dir, f"{reel_id}.jpg")
    subprocess.run(["ffmpeg", "-y", "-i", video_path, "-ss", "00:00:01.000", "-vframes", "1", thumb_path], check=False)
    store_file_to_minio(thumb_path, "thumbs", f"{reel_id}.jpg")

    # Update DB
    db = get_db_client()
    db.reels.update_one({"_id": reel_id}, {"$set": {
        "s3_video": f"reels/{video_key}",
        "thumbnail": f"thumbs/{reel_id}.jpg",
        "processed_at": datetime.utcnow(),
        "processed": True
    }}, upsert=True)

    # Enqueue AI tasks: (for MVP we can call simple inline functions or place messages into Redis)
    # For scale: produce to Kafka or another Celery queue

