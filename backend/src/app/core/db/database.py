from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass, sessionmaker
from urllib.parse import quote_plus

from ..config import settings


class Base(DeclarativeBase, MappedAsDataclass):
    pass


# build DB URL with optional full override and URL-encoded creds
if settings.POSTGRES_URL:
    DATABASE_URL = settings.POSTGRES_URL
else:
    uri = (
        f"{quote_plus(settings.POSTGRES_USER)}:"
        f"{quote_plus(settings.POSTGRES_PASSWORD)}@"
        f"{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/"
        f"{settings.POSTGRES_DB}"
    )
    DATABASE_URL = f"{settings.POSTGRES_ASYNC_PREFIX}{uri}"

async_engine = create_async_engine(DATABASE_URL, echo=False, future=True)

local_session = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


async def async_get_db() -> AsyncSession:
    async_session = local_session
    async with async_session() as db:
        yield db
