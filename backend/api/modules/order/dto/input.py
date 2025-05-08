from typing import List
from datetime import datetime
from pydantic import BaseModel

class OrderDetail(BaseModel):
  """DTO for order detail"""
  productCode:  str
  productName: str
  quantity: float

class StockOut(BaseModel):
  """DTO for stock out response"""
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
  timestamp: datetime

class StockOutRequest(BaseModel):
  """DTO for stock out request"""
  orderCode: str