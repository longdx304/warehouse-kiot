from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import AsyncGenerator
from fastapi import Depends

from api.config import settings

# Create SQLAlchemy engine
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
async_session_factory = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        # For development purposes, uncomment this to reset tables:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async DB sessions"""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        