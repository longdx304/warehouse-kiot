from sqlalchemy import Column, String, JSON
from api.database import Base
from api.models.base import TimestampModel

class Warehouse(Base, TimestampModel):
    """Warehouse entity model"""
    __tablename__ = "warehouses"
    
    id = Column(String, primary_key=True)
    location = Column(String, nullable=False)
    
    def __repr__(self):
        return f"<Warehouse {self.id}: {self.location}>"
