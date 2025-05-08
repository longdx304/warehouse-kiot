from sqlalchemy import Column, String, Integer, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import TimestampModel

class WarehouseInventory(Base, TimestampModel):
    """Warehouse inventory entity model"""
    __tablename__ = "warehouse_inventory"
    
    id = Column(String, primary_key=True)
    warehouse_id = Column(String, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=0)
    unit_id = Column(String, ForeignKey("item_units.id"), nullable=False)
    
    # Relationships
    warehouse = relationship("Warehouse")
    unit = relationship("ItemUnit")
    
    # Make sku unique per warehouse
    __table_args__ = (
        UniqueConstraint('warehouse_id', 'sku', name='uix_warehouse_sku'),
    )
    
    def __repr__(self):
        return f"<WarehouseInventory {self.warehouse_id}: {self.sku} - {self.quantity}>"
