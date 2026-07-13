from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

class Base(DeclarativeBase):
    pass


DATABASE_URL = settings.database_url

# Handle Supabase connection
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

if "supabase.com" in DATABASE_URL:
    # Remove query parameters for Supabase
    DATABASE_URL = DATABASE_URL.split("?")[0]
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"sslmode": "require"}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
    )


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)