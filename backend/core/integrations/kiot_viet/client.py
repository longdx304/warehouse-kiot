from typing import Dict, Any, Optional
import httpx
import time
from api.config import settings
from api.logger import logger

class KiotVietClient:
    """KiotViet API integration client"""
    
    def __init__(self, client_id: str = None, client_secret: str = None):
        self.base_url = settings.KIOTVIET_BASE_URL
        self.auth_url = settings.KIOTVIET_AUTH_URL
        self.client_id = client_id or settings.KIOTVIET_CLIENT_ID
        self.client_secret = client_secret or settings.KIOTVIET_CLIENT_SECRET
        self.retailer = settings.KIOTVIET_RETAILER
        self.token = None
        self.token_expires_at = 0
    
    async def _get_auth_token(self) -> str:
        """Get authentication token, refresh if expired"""
        current_time = time.time()
        
        # Check if token is still valid
        if self.token and self.token_expires_at > current_time + 60:
            logger.info("Using existing KiotViet token")
            return self.token
        
        # Request new token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/connect/token",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials",
                    "scopes": "PublicApi.Access",
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to get KiotViet token: {response.text}")
                raise Exception(f"Failed to authenticate with KiotViet: {response.text}")
            
            data = response.json()
            self.token = data["access_token"]
            self.token_expires_at = current_time + data["expires_in"]
            logger.info(f"KiotViet token: {self.token}")
            return self.token
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Dict[str, Any] = None,
        data: Dict[str, Any] = None,
        retry: bool = True
    ) -> Dict[str, Any]:
        """Make authenticated request to KiotViet API"""
        token = await self._get_auth_token()
        
        headers = {
            "Retailer": self.retailer,
            "Authorization": f"Bearer {token}"
        }
        
        url = f"{self.base_url}{endpoint}"
        
        async with httpx.AsyncClient() as client:
            try:
                if method.lower() == "get":
                    response = await client.get(url, headers=headers, params=params)
                elif method.lower() == "post":
                    response = await client.post(url, headers=headers, json=data)
                elif method.lower() == "put":
                    response = await client.put(url, headers=headers, json=data)
                elif method.lower() == "delete":
                    response = await client.delete(url, headers=headers)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                # Handle token expiration
                if response.status_code == 401 and retry:
                    self.token = None
                    return await self._request(method, endpoint, params, data, retry=False)
                
                # Check for errors
                if response.status_code >= 400:
                    logger.error(f"KiotViet API error: {response.text}")
                    raise Exception(f"KiotViet API error: {response.text}")
                
                return response.json()
                
            except httpx.RequestError as e:
                logger.error(f"KiotViet request failed: {str(e)}")
                raise Exception(f"KiotViet request failed: {str(e)}")
    
    # API endpoints
    async def get_orders(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get orders from KiotViet"""
        return await self._request("GET", "/orders", params=params)
    
    async def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific order by its id"""
        # Convert order_id to string if not already
        order_id = str(order_id)
        
        params = {"orderId": order_id}
        response = await self._request("GET", "/orders", params=params)
        
        if response.get("total", 0) == 0 or not response.get("data"):
            logger.warning(f"No order found with id: {order_id}")
            return None
        
        return response["data"][0]
      