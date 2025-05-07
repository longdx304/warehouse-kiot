from sqlalchemy import Column, String, Float
from api.database import Base
from api.models.base import TimestampModel

class ItemUnit(Base, TimestampModel):
    """Item unit entity model"""
    __tablename__ = "item_units"
    
    id = Column(String, primary_key=True)
    unit = Column(String, nullable=False, unique=True)
    quantity = Column(Float, nullable=False, default=1.0)
    
    def __repr__(self):
        return f"<ItemUnit {self.unit}: {self.quantity}>"