from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    sender_name: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MatchExchange(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    match_id: str  # Format: "id1-id2"
    userA_id: str
    userB_id: str
    status: str = "MATCHED"  # MATCHED, IN_TRAINING, TRAINING_COMPLETE, PROJECT_EXCHANGED
    userA_training_done: bool = False
    userB_training_done: bool = False
    project_file_a: Optional[str] = None
    project_file_b: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
