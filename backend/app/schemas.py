from pydantic import BaseModel, Field
from typing import Optional

# Shared properties
class ImageBase(BaseModel):
    prompt: str

# Properties to receive on item creation
class ImageCreate(ImageBase):
    negative_prompt: Optional[str] = None
    style: Optional[str] = None
    aspect_ratio: Optional[str] = Field(None, alias='aspect_ratio')
    color: Optional[str] = None
    composition: Optional[str] = None
    lighting: Optional[str] = None
    image_b64: Optional[str] = Field(None, alias='image_b64')
    reference_strength: Optional[float] = Field(None, alias='reference_strength')
    turnstile_token: str = Field(..., alias='turnstile_token')

# Properties stored in DB
class ImageInDBBase(ImageBase):
    id: int
    owner_id: Optional[int] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# Properties to return to client
class Image(ImageInDBBase):
    pass 