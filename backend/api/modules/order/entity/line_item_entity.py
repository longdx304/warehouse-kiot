from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import TimestampModel

class LineItem(Base, TimestampModel):
    """Line item entity model for order details from KiotViet API"""
    __tablename__ = "line_items"
    
    id = Column(String, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_code = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    warehouse_inventory = Column(Float, nullable=True) 
    
    # Relationships
    order = relationship("Order", back_populates="items")
    
    def __repr__(self):
        return f"<LineItem {self.product_code}: {self.quantity}>"
