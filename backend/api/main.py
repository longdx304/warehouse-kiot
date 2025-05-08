from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from api.middlewares.logging_middleware import LoggingMiddleware
from api.database import init_db, async_session_factory
from api.config import settings

# Import routers
from api.modules.user.controller.user_controller import router as user_router
from api.modules.warehouse.controller.warehouse_controller import router as warehouse_router
from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import router as inventory_router
from api.modules.item_unit.controller.item_unit_controller import router as item_unit_router
from api.modules.order.controller import stock_out_router

app = FastAPI(
    title="Warehouse Management API",
    description="API for managing warehouses and inventory",
    version="0.1.0",
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(warehouse_router, prefix="/api/warehouses", tags=["Warehouses"])
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(item_unit_router, prefix="/api/units", tags=["Item Units"])
app.include_router(stock_out_router, prefix="/api/stock-out", tags=["Stock Out"])

@app.on_event("startup")
async def startup_event():
    await init_db()
    # Bootstrap super admin if credentials provided
    import os
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    if admin_email and admin_password:
        from sqlalchemy import select
        from api.modules.user.entity.user_entity import User, UserRole
        from api.modules.user.dto.input import UserCreate
        from api.modules.user.service.user_service import UserService

        async with async_session_factory() as session:
            result = await session.execute(select(User).filter_by(email=admin_email))
            existing = result.scalars().first()
            if not existing:
                dto = UserCreate(
                    email=admin_email,
                    username=admin_email.split("@")[0],
                    password=admin_password,
                    role=UserRole.ADMIN,
                )
                await UserService(session).create_user(dto)
                await session.commit()

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)