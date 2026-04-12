from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException #, UploadFile, File
import shutil
import uuid
import os
import json
from datetime import datetime
from typing import Dict, List

from database import exchanges_collection, messages_collection

router = APIRouter()

# ─────────────────────────────────────────────
# POST /collaboration/exchange/{match_id}/upload — Project Exchange
# (Temporarily Disabled - missing python-multipart)
# ─────────────────────────────────────────────
# Phase 2 Exchange removed in favor of Credit Rewards System.

# ─────────────────────────────────────────────
# WebSocket Connection Manager
# ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, match_id: str):
        match_id = match_id.replace(" ", "-")
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)

    def disconnect(self, websocket: WebSocket, match_id: str):
        match_id = match_id.replace(" ", "-")
        if match_id in self.active_connections:
            self.active_connections[match_id].remove(websocket)

    async def broadcast(self, message: str, match_id: str):
        match_id = match_id.replace(" ", "-")
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                await connection.send_text(message)

manager = ConnectionManager()

# ─────────────────────────────────────────────
# WebSocket Chat Endpoint
# ─────────────────────────────────────────────
@router.websocket("/ws/chat/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: str):
    match_id = match_id.replace(" ", "-")
    await manager.connect(websocket, match_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            chat_msg = {
                "match_id": match_id,
                "sender_name": message_data.get("sender", "Unknown"),
                "content": message_data.get("content", ""),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            messages_collection.insert_one(chat_msg)
            # PyMongo inserts an ObjectId which crashes default json.dumps. Use default=str
            await manager.broadcast(json.dumps(chat_msg, default=str), match_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)
    except Exception as e:
        print(f"WebSocket Error: {str(e)}")
        manager.disconnect(websocket, match_id)

# ─────────────────────────────────────────────
# Chat & Exchange Endpoints
# ─────────────────────────────────────────────
@router.get("/collaboration/chat/{match_id}", tags=["Collaboration"])
async def get_chat_history(match_id: str):
    match_id = match_id.replace(" ", "-")
    msgs = messages_collection.find({"match_id": match_id})
    if hasattr(msgs, 'sort'):
        msgs.sort("timestamp", 1)
    
    history = []
    for m in msgs:
        history.append({
            "sender_name": m.get("sender_name", "Unknown"),
            "content": m.get("content", ""),
            "timestamp": m.get("timestamp", "")
        })
    return history

@router.get("/collaboration/exchange/{match_id}", tags=["Collaboration"])
async def get_exchange_status(match_id: str):
    match_id = match_id.replace(" ", "-")
    exchange = exchanges_collection.find_one({"match_id": match_id})
    if not exchange:
        # Match ID is usually userAId_userBId or similar. If UUIDs are used, we need to be careful.
        # However, it's safer to just store them as provided in the URL if we can't split cleanly.
        user_a = "Partner A"
        user_b = "Partner B"
        
        # Try to find user IDs in the match_id string (legacy support)
        if "_" in match_id:
            user_a, user_b = match_id.split("_", 1)
        elif "-" in match_id:
            parts = match_id.split("-")
            # Two UUID strings appended by '-' equates to 10 split array elements
            if len(parts) == 10:
                id1 = "-".join(parts[:5])
                id2 = "-".join(parts[5:])
                from database import skills_collection
                sa = skills_collection.find_one({"_id": id1})
                sb = skills_collection.find_one({"_id": id2})
                if sa: user_a = sa.get("user_name", "Partner A")
                if sb: user_b = sb.get("user_name", "Partner B")
        
        exchange = {
            "match_id": match_id,
            "userA_id": user_a,
            "userB_id": user_b,
            "status": "MATCHED",
            "userA_training_done": False,
            "userB_training_done": False,
            "created_at": datetime.utcnow().isoformat()
        }
        exchanges_collection.insert_one(exchange)
    
    exchange["_id"] = str(exchange.get("_id", ""))
    return exchange

@router.patch("/collaboration/exchange/{match_id}/training", tags=["Collaboration"])
async def mark_training_done(match_id: str, user_id: str):
    match_id = match_id.replace(" ", "-")
    exchange = exchanges_collection.find_one({"match_id": match_id})
    if not exchange:
        raise HTTPException(status_code=404, detail="Exchange not found")
    
    update_field = ""
    if str(exchange.get("userA_id")) == user_id:
        update_field = "userA_training_done"
    elif str(exchange.get("userB_id")) == user_id:
        update_field = "userB_training_done"
    else:
        if not exchange.get("userA_training_done"):
            update_field = "userA_training_done"
        else:
            update_field = "userB_training_done"
    
    exchanges_collection.update_one(
        {"match_id": match_id},
        {"$set": {update_field: True}}
    )

    updated = exchanges_collection.find_one({"match_id": match_id})
    if updated.get("userA_training_done") and updated.get("userB_training_done") and updated.get("status") != "COMPLETED":
        # AWARD CREDITS (+10 each)
        from database import users_collection
        
        # Robust ID retrieval: look at explicit fields first, fallback to match_id segments
        candidates = set([updated.get("userA_id"), updated.get("userB_id"), user_id])
        
        # Also try to find who else was in the match if those IDs are partials
        ids = match_id.split("-")
        if len(ids) == 2: 
            candidates.update(ids) 
        elif len(ids) == 10:
            u1 = "-".join(ids[:5])
            u2 = "-".join(ids[5:])
            from database import skills_collection
            sa = skills_collection.find_one({"_id": u1})
            sb = skills_collection.find_one({"_id": u2})
            if sa: candidates.add(sa.get("user_name", "Unknown"))
            if sb: candidates.add(sb.get("user_name", "Unknown"))

        for uid in candidates:
            if not uid or uid == "Unknown" or uid == "Partner A" or uid == "Partner B": continue
            user = users_collection.find_one({"_id": uid}) or users_collection.find_one({"user_name": uid})
            if user:
                new_balance = user.get("credits", 50) + 10
                users_collection.update_one({"_id": user["_id"]}, {"$set": {"credits": new_balance}})
                print(f"AWARD: +10 credits to {user.get('user_name')} (New Total: {new_balance})")

        exchanges_collection.update_one(
            {"match_id": match_id},
            {"$set": {"status": "COMPLETED"}}
        )
        return {"message": "Barter Complete!", "status": "COMPLETED", "rewarded": True}

    return {"message": "Success", "status": updated.get("status", "MATCHED")}
