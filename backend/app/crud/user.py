from sqlalchemy.orm import Session
from app.models.user import User

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Retrieves a user by their email address.
    """
    return db.query(User).filter(User.email == email).first()

def add_credits_to_user(db: Session, user_id: int, credits_to_add: int):
    """
    Adds a specified number of credits to a user's account by their ID.
    """
    user = get_user(db, user_id=user_id)
    if user:
        user.credits = (user.credits or 0) + credits_to_add
        db.commit()
        db.refresh(user)
    return user 