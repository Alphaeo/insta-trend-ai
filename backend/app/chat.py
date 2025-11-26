from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from datetime import datetime
import json
import uuid
import asyncio
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from app.db import get_db_client
from app.auth import get_current_user_ws, get_current_user
import redis.asyncio as redis
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modèle Pydantic pour les messages
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    topic: str = "general"
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            'ObjectId': str,
            'datetime': lambda v: v.isoformat()
        }
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "507f1f77bcf86cd799439011",
                "username": "johndoe",
                "topic": "general",
                "message": "Hello, world!",
                "created_at": "2023-01-01T12:00:00Z"
            }
        }

# Modèle pour la requête d'envoi de message
class MessageCreate(BaseModel):
    message: str
    topic: str = "general"

# Gestionnaire de connexions WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")
        
    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)
    
    async def broadcast(self, message: str, topic: str = "general"):
        # Publie le message sur le canal Redis
        await self.redis_client.publish(f"chat:{topic}", message)
        
        # Envoie également à tous les clients connectés sur ce topic
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
    
    async def subscribe_to_topic(self, topic: str = "general"):
        await self.pubsub.subscribe(f"chat:{topic}")
        return self.pubsub

# Initialisation du routeur et du gestionnaire de connexions
router = APIRouter(prefix="/chat", tags=["chat"])
manager = ConnectionManager()

# Endpoints REST
@router.get("/messages", response_model=List[ChatMessage])
async def get_messages(
    topic: str = "general",
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Récupère les derniers messages d'un topic"""
    db = get_db_client()
    messages = list(db.chat_messages.find(
        {"topic": topic}
    ).sort("created_at", -1).limit(limit))
    
    # Convertir ObjectId en string pour le JSON
    for msg in messages:
        msg["id"] = str(msg["_id"])
        del msg["_id"]
    
    return messages

@router.post("/send", response_model=ChatMessage)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Endpoint de secours pour envoyer un message via HTTP (au cas où WebSocket échoue)"""
    db = get_db_client()
    
    # Créer un nouveau message
    new_message = ChatMessage(
        user_id=str(current_user["_id"]),
        username=current_user.get("username", "Anonymous"),
        topic=message_data.topic,
        message=message_data.message[:500]  # Limiter la longueur du message
    )
    
    # Sauvegarder dans MongoDB
    result = db.chat_messages.insert_one(new_message.dict())
    
    # Publier le message via Redis
    await manager.broadcast(
        json.dumps({
            "event": "new_message",
            "data": new_message.dict()
        }),
        topic=message_data.topic
    )
    
    return {**new_message.dict(), "id": str(result.inserted_id)}

# Gestionnaire WebSocket
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """Gère les connexions WebSocket pour le chat en temps réel"""
    try:
        # Authentifier l'utilisateur via le token JWT
        user = await get_current_user_ws(token)
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = str(user["_id"])
        username = user.get("username", "Anonymous")
        
        # Accepter la connexion
        await manager.connect(websocket, user_id)
        
        # S'abonner au topic par défaut
        pubsub = await manager.subscribe_to_topic()
        
        # Tâche pour écouter les messages Redis
        async def listen_redis():
            try:
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await websocket.send_text(message["data"])
            except Exception as e:
                logger.error(f"Redis listener error: {e}")
        
        # Démarrer l'écoute Redis dans une tâche séparée
        redis_task = asyncio.create_task(listen_redis())
        
        try:
            # Boucle principale pour recevoir les messages du client
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    
                    # Créer un nouveau message
                    new_message = ChatMessage(
                        user_id=user_id,
                        username=username,
                        topic=message_data.get("topic", "general"),
                        message=message_data.get("message", "")[:500],
                        created_at=datetime.utcnow()
                    )
                    
                    # Sauvegarder dans MongoDB
                    db = get_db_client()
                    db.chat_messages.insert_one(new_message.dict())
                    
                    # Publier le message
                    await manager.broadcast(
                        json.dumps({
                            "event": "new_message",
                            "data": new_message.dict()
                        }),
                        topic=new_message.topic
                    )
                    
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Invalid JSON format"
                    }))
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": str(e)
                    }))
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {user_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            # Nettoyage
            redis_task.cancel()
            await manager.disconnect(user_id)
            
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        try:
            await websocket.close()
        except:
            pass

# Fonction pour nettoyer les anciens messages (à exécuter périodiquement)
async def cleanup_old_messages(max_messages: int = 200):
    """Supprime les anciens messages pour ne garder que les N plus récents par topic"""
    db = get_db_client()
    
    # Récupérer    db = get_db_client()
    topics = db.chat_messages.distinct("topic")
    
    for topic in topics:
        recent_messages = list(db.chat_messages.find(
            {"topic": topic}
        ).sort("created_at", -1).limit(max_messages))
        
        if recent_messages:
            # Garder uniquement les messages les plus récents
            db.chat_messages.delete_many({
                "topic": topic,
                "_id": {"$nin": [msg["_id"] for msg in recent_messages]}
            })
            
            logger.info(f"Cleaned up old messages for topic '{topic}'. Kept {len(recent_messages)} most recent messages.")

# Fonction pour initialiser les index MongoDB
async def init_chat_indexes():
    """Crée les index nécessaires pour les performances"""
    db = get_db_client()
    db.chat_messages.create_index([("topic", 1), ("created_at", -1)])
    db.chat_messages.create_index("user_id")
    logger.info("Chat database indexes created/verified")
