from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash
import json
from datetime import datetime

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_stripe_customer_id(db: Session, stripe_customer_id: str):
    return db.query(models.User).filter(models.User.stripe_customer_id == stripe_customer_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user: models.User, user_update: schemas.UserUpdate):
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_stripe_customer_id(db: Session, user_id: int, stripe_customer_id: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.stripe_customer_id = stripe_customer_id
        db.commit()
        db.refresh(db_user)
    return db_user

# Plan and Subscription CRUD

def create_plan(db: Session, plan: schemas.PlanCreate):
    db_plan = models.Plan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_plan_by_stripe_price_id(db: Session, stripe_price_id: str):
    return db.query(models.Plan).filter(models.Plan.stripe_price_id == stripe_price_id).first()

def create_or_update_subscription(db: Session, user_id: int, plan_id: int, sub_details: dict):
    
    subscription = db.query(models.Subscription).filter_by(user_id=user_id).first()

    if subscription:
        # Update existing subscription
        subscription.plan_id = plan_id
        subscription.stripe_subscription_id = sub_details['id']
        subscription.status = sub_details['status']
        subscription.current_period_start = datetime.fromtimestamp(sub_details['current_period_start'])
        subscription.current_period_end = datetime.fromtimestamp(sub_details['current_period_end'])
    else:
        # Create new subscription
        subscription = models.Subscription(
            user_id=user_id,
            plan_id=plan_id,
            stripe_subscription_id=sub_details['id'],
            status=sub_details['status'],
            current_period_start=datetime.fromtimestamp(sub_details['current_period_start']),
            current_period_end=datetime.fromtimestamp(sub_details['current_period_end'])
        )
        db.add(subscription)
    
    db.commit()
    db.refresh(subscription)
    return subscription

def update_subscription_status(db: Session, stripe_subscription_id: str, new_status: str, period_end: int):
    subscription = db.query(models.Subscription).filter_by(stripe_subscription_id=stripe_subscription_id).first()
    if subscription:
        subscription.status = new_status
        subscription.current_period_end = datetime.fromtimestamp(period_end)
        db.commit()
        db.refresh(subscription)
    return subscription

# Image CRUD
def create_user_image(db: Session, user_id: int, prompt: str, image_url: str):
    db_image = models.Image(
        owner_id=user_id,
        prompt=prompt,
        image_url=image_url
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_image(db: Session, image_id: int, user_id: int):
    return db.query(models.Image).filter(models.Image.id == image_id, models.Image.owner_id == user_id).first()

def get_user_images(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Image).filter(models.Image.owner_id == user_id).offset(skip).limit(limit).all()

# Shared Image CRUD
def share_image(db: Session, image_id: int, user_id: int):
    # First, mark the original image as public
    db_image = db.query(models.Image).filter(models.Image.id == image_id, models.Image.owner_id == user_id).first()
    if db_image:
        db_image.is_public = True
        
        # Check if it's already shared
        existing_shared = db.query(models.SharedImage).filter(models.SharedImage.image_id == image_id).first()
        if existing_shared:
            return existing_shared

        db_shared_image = models.SharedImage(
            image_id=image_id,
            user_id=user_id,
            title=db_image.prompt[:100] # Use prompt as a default title
        )
        db.add(db_shared_image)
        db.commit()
        db.refresh(db_shared_image)
        return db_shared_image
    return None

def favorite_image(db: Session, image_id: int, user_id: int):
    # Check if already favorited
    db_fav = db.query(models.Favorite).filter_by(shared_image_id=image_id, user_id=user_id).first()
    if db_fav:
        return None # Or return the existing favorite

    db_fav = models.Favorite(shared_image_id=image_id, user_id=user_id)
    db.add(db_fav)
    
    # Increment likes count
    db_image = db.query(models.SharedImage).filter_by(id=image_id).first()
    if db_image:
        db_image.likes += 1

    db.commit()
    db.refresh(db_fav)
    return db_fav

def unfavorite_image(db: Session, image_id: int, user_id: int):
    db_fav = db.query(models.Favorite).filter_by(shared_image_id=image_id, user_id=user_id).first()
    if not db_fav:
        return None

    db.delete(db_fav)

    # Decrement likes count
    db_image = db.query(models.SharedImage).filter_by(id=image_id).first()
    if db_image and db_image.likes > 0:
        db_image.likes -= 1

    db.commit()
    return {"status": "success", "message": "unfavorited"}

def get_community_images(db: Session, sort: str, search: str, skip: int = 0, limit: int = 20):
    query = db.query(models.SharedImage)

    # Filtering logic
    if search:
        query = query.filter(models.SharedImage.title.ilike(f'%{search}%'))
    
    # Sorting logic
    if sort == "newest":
        query = query.order_by(models.SharedImage.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(models.SharedImage.created_at.asc())
    elif sort == "most_liked":
        query = query.order_by(models.SharedImage.likes.desc())
    
    return query.offset(skip).limit(limit).all() 