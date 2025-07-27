from sqlalchemy.orm import Session
from typing import List, Optional

from .base import CRUDBase
from app.models.image import Image
from app.schemas import ImageCreate

class CRUDImage(CRUDBase[Image, ImageCreate, ImageCreate]):
    def create_with_owner(
        self, db: Session, *, obj_in: ImageCreate, owner_id: int, image_url: str
    ) -> Image:
        db_obj = Image(
            prompt=obj_in.prompt,
            style=obj_in.style,
            color=obj_in.color,
            lighting=obj_in.lighting,
            composition=obj_in.composition,
            owner_id=owner_id,
            image_url=image_url
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Image]:
        return (
            db.query(self.model)
            .filter(Image.owner_id == owner_id)
            .order_by(Image.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

image = CRUDImage(Image) 