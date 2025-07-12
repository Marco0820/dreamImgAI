from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class CreditPackage(Base):
    __tablename__ = "credit_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price_id = Column(String, unique=True, index=True, nullable=False) # Creem Price ID
    credits_amount = Column(Integer, nullable=False)
    price_display = Column(String) # e.g., "$5"
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True) 