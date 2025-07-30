from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String, index=True)
    image_url = Column(String)
    owner_id = Column(String(255), ForeignKey("users.id"))  # 修改为String类型匹配users.id

    owner = relationship("User", back_populates="images") 