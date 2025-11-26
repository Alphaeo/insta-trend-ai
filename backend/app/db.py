# app/db.py
from pymongo import MongoClient
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_mongo = None

def get_db_client():
    """
    Retourne l'objet 'db' (Database) connecté à la DB indiquée par MONGO_DB.
    Exemple d'utilisation:
        db = get_db_client()
        users_col = db['users']
        reels_col = db['reelsdb']
    """
    global _mongo
    if _mongo is None:
        uri = os.getenv("MONGO_URI")
        db_name = os.getenv("MONGO_DB", "KBA")  # default to KBA
        if not uri:
            raise ValueError("MONGO_URI is not set in environment variables")
        # Connect without specifying DB in URI; then select db_name
        client = MongoClient(uri)
        _mongo = client[db_name]
        logger.info(f"Connected to MongoDB DB='{db_name}' via URI")
    return _mongo

# MinIO helper (S3-compatible)
import boto3
from botocore.client import Config

_minio_client = None

def get_minio_client():
    """
    Get or create MinIO client (singleton).
    """
    global _minio_client
    if _minio_client is None:
        endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
        access = os.getenv("MINIO_ACCESS", "minioadmin")
        secret = os.getenv("MINIO_SECRET", "minioadmin")
        secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        _minio_client = boto3.client(
            's3',
            endpoint_url=f"http://{endpoint}" if not secure else f"https://{endpoint}",
            aws_access_key_id=access,
            aws_secret_access_key=secret,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
    return _minio_client

def store_file_to_minio(local_path, bucket, key):
    """
    Upload un fichier vers MinIO et retourne l'URL publique pour y accéder.
    Retourne toujours une URL relative qui sera servie par l'endpoint /files/{bucket}/{key}
    """
    s3 = get_minio_client()
    # Créer le bucket s'il n'existe pas
    try:
        s3.head_bucket(Bucket=bucket)
    except Exception:
        s3.create_bucket(Bucket=bucket)
    
    # Upload du fichier
    s3.upload_file(local_path, bucket, key)
    
    # Retourner une URL relative qui sera servie par l'endpoint /files/{bucket}/{key}
    url = f"/files/{bucket}/{key}"
    
    logger.info(f"Fichier uploadé: {url}")
    return url


