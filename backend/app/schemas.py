from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[int] = None


# User Schemas
class UserBase(BaseModel):
    email: str
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    avatar: Optional[str] = None
    bio: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    created_at: datetime
    subscription: Optional['Subscription'] = None # Forward reference
    
    class Config:
        from_attributes = True


# Plan Schemas
class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    features: Dict[str, Any]
    stripe_price_id: str

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: int

    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int

class SubscriptionCreate(SubscriptionBase):
    stripe_subscription_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime

class CheckoutSessionCreate(BaseModel):
    priceId: str

class CheckoutSession(BaseModel):
    sessionId: str
    url: str

class Subscription(SubscriptionBase):
    id: int
    stripe_subscription_id: str

    class Config:
        from_attributes = True

# Image Schemas
class ImageBase(BaseModel):
    prompt: str
    model: str
    parameters: Optional[Dict[str, Any]] = {}
    image_url: str

class ImageCreate(ImageBase):
    n: Optional[int] = 1
    size: Optional[str] = "1024x1024"
    negative_prompt: Optional[str] = None

class ImageGenerate(BaseModel):
    prompt: str
    model: str
    negative_prompt: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = {}

class Image(ImageBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SDXLImageGenerate(BaseModel):
    prompt: str

# Shared Image Schemas
class SharedImage(BaseModel):
    id: int
    image_id: int
    user_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    likes: int
    views: int
    shares: int
    created_at: datetime
    user: User
    image: Image

    class Config:
        from_attributes = True 