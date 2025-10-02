from pymongo import MongoClient
import os

_mongo = None

def get_db_client():
    global _mongo
    if _mongo is None:
        uri = os.getenv("MONGO_URI", "mongodb://mongo:27017")
        _mongo = MongoClient(uri)[os.getenv("MONGO_DB", "reelsdb")]
    return _mongo

# MinIO helper (S3-compatible)
import boto3
from botocore.client import Config

def get_minio_client():
    endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
    access = os.getenv("MINIO_ACCESS", "minioadmin")
    secret = os.getenv("MINIO_SECRET", "minioadmin")
    secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
    s3 = boto3.client(
        's3',
        endpoint_url=f"http://{endpoint}" if not secure else f"https://{endpoint}",
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        config=Config(signature_version='s3v4'),
        region_name='us-east-1'
    )
    return s3

def store_file_to_minio(local_path, bucket, key):
    s3 = get_minio_client()
    # create bucket if missing
    try:
        s3.head_bucket(Bucket=bucket)
    except:
        s3.create_bucket(Bucket=bucket)
    s3.upload_file(local_path, bucket, key)
    url = f"/{bucket}/{key}"
    return url

