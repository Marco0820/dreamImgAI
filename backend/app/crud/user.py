from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            is_superuser=obj_in.is_superuser,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def create_with_id(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Creates a user with a specific string ID, with a hashed placeholder password.
        Used for users created via NextAuth social logins.
        """
        db_obj = User(
            id=obj_in.id,
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),  # Hash the placeholder password
            credits=obj_in.credits,
            is_superuser=False # Default value
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password

        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(
        self, db: Session, *, email: str, password: str
    ) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

    def get_by_id_str(self, db: Session, *, id: str) -> Optional[User]:
        """
        Retrieves a user by their string ID.
        """
        return db.query(User).filter(User.id == id).first()

    def add_credits(self, db: Session, *, user_id: str, amount: int) -> Optional[User]:
        """
        Adds credits to a user's account using their string ID.
        """
        user = self.get_by_id_str(db, id=user_id)
        if user:
            user.credits = (user.credits or 0) + amount
            db.commit()
            db.refresh(user)
        return user


user = CRUDUser(User) 