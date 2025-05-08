from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings

def add_cors_middleware(app: FastAPI) -> None:
    """
    Add CORS middleware to FastAPI application
    
    Args:
        app: FastAPI application instance
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    