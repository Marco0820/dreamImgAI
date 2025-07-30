from sqlalchemy import Integer, String, Boolean, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from app.database import Base
from typing import Optional


class User(Base, SQLAlchemyBaseUserTable[str]):
    __tablename__ = "users"

    # Changed from Integer to String to support CUIDs from NextAuth
    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    
    # fastapi-users required fields
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(1024), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Custom fields
    credits: Mapped[int] = mapped_column(Integer, nullable=False, default=100, server_default="100")
    credits_spent: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    
    # Stripe/Creem related fields
    creem_customer_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    creem_subscription_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    creem_price_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    images = relationship("Image", back_populates="owner") 