from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    username = Column(String, index=True)
    avatar = Column(String, default="https://picsum.photos/200/200")
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    stripe_customer_id = Column(String, unique=True, index=True, nullable=True) # <-- Add this line
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    images = relationship("Image", back_populates="user")
    shared_images = relationship("SharedImage", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    price = Column(Integer) # Price in cents
    features = Column(JSON)
    stripe_price_id = Column(String, unique=True)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    stripe_subscription_id = Column(String, unique=True, index=True)
    status = Column(String) # e.g., 'active', 'canceled', 'past_due'
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscription")
    plan = relationship("Plan")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(Text)
    negative_prompt = Column(Text, nullable=True)
    model = Column(String)
    parameters = Column(Text)  # 存储为JSON字符串
    image_url = Column(String)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="images")
    shared_image = relationship("SharedImage", uselist=False, back_populates="image")

class SharedImage(Base):
    __tablename__ = "shared_images"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="shared_images")
    image = relationship("Image", back_populates="shared_image")
    comments = relationship("Comment", back_populates="shared_image")
    favorites = relationship("Favorite", back_populates="shared_image")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    shared_image_id = Column(Integer, ForeignKey("shared_images.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    shared_image = relationship("SharedImage", back_populates="comments")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    shared_image_id = Column(Integer, ForeignKey("shared_images.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="favorites")
    shared_image = relationship("SharedImage", back_populates="favorites")