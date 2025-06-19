from sqlalchemy.orm import Session
from app.models.image import Image
from app.schemas import ImageCreate
from typing import Optional

def create_with_owner(db: Session, *, prompt: str, user_id: Optional[int], image_url: str) -> Image:
    # We only use the prompt from obj_in for the DB record.
    # The full details are not stored to keep the DB light.
    db_obj = Image(prompt=prompt, owner_id=user_id, image_url=image_url)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj 