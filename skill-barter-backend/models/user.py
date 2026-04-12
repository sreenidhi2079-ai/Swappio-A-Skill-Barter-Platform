from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    user_name: str
    credits: int = 50

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
