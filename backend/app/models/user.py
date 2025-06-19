from sqlalchemy import Integer, String, Boolean, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from app.database import Base


class User(Base, SQLAlchemyBaseUserTable[int]):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hashed_password: Mapped[str] = mapped_column(String(1024), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    images = relationship("Image", back_populates="owner") 