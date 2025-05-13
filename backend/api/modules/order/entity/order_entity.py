from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import TimestampModel

class Order(Base, TimestampModel):
    """Order entity model from KiotViet API"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True)
    code = Column(String, nullable=False, unique=True)
    customer_name = Column(String, nullable=True)
    status = Column(Integer, nullable=False)
    status_value = Column(String, nullable=True)
    handler_id = Column(String, nullable=True)
    handler_at = Column(DateTime, nullable=True)
    
    
    # Relationships
    items = relationship("LineItem", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order {self.code}: {self.status_value}>"
