"""
models/skill.py
---------------
Pydantic schemas for the Skill listing resource.
Used for request validation (SkillCreate) and API responses (SkillResponse).
"""

from pydantic import BaseModel, Field
from typing import Optional


class SkillCreate(BaseModel):
    """Schema for creating a new skill listing (incoming request body)."""
    user_name: str = Field(..., min_length=1, description="Name of the user posting the skill")
    skill_offered: str = Field(..., min_length=1, description="Skill the user is offering")
    skill_requested: str = Field(..., min_length=1, description="Skill the user is looking for in exchange")
    description: Optional[str] = Field(default="", description="Additional details about the skill or exchange")
    location: Optional[str] = Field(default="Remote", description="User's location or timezone")
    contact: Optional[str] = Field(default="", description="How to reach this user (email, social, etc.)")
    availability: Optional[str] = Field(default="Flexible", description="When the user is available for exchange")


class SkillResponse(BaseModel):
    """Schema returned by the API for a skill listing."""
    id: str = Field(..., description="MongoDB document ID as a string")
    user_name: str
    skill_offered: str
    skill_requested: str
    description: Optional[str] = ""
    location: Optional[str] = "Remote"
    contact: Optional[str] = ""
    availability: Optional[str] = "Flexible"


class MatchResult(BaseModel):
    """Schema representing a barter match between two users."""
    match_id: str
    userA_name: str
    userA_offer: str
    userA_wants: str
    userB_name: str
    userB_offer: str
    userB_wants: str
