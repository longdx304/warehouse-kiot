from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class OrderDetail(BaseModel):
  """DTO for order detail"""
  productCode:  str
  productName: str
  quantity: float

class StockOut(BaseModel):
  """DTO for stock out response"""
  id: int
  code: str
  customerName: str
  status: int
  statusValue: str
  orderDetails : List[OrderDetail]
  retailerId: int
  modifiedDate: datetime
  createdDate: datetime

class StockOutResponse(BaseModel):
  """DTO for stock out response"""
  total: int
  pageSize: int
  data: List[StockOut]
  timestamp: datetime = datetime.utcnow()

class StockOutRequest(BaseModel):
  """DTO for stock out request"""
  orderCode: str

class AssignOrderRequest(BaseModel):
  """DTO for assign order request"""
  order_id: str
  user_id: str

class UnassignOrderRequest(BaseModel):
  """DTO for unassign order request"""
  order_id: str

class OrderActionResponse(BaseModel):
  """DTO for order action response"""
  success: bool
  message: str
  order_id: Optional[str] = None