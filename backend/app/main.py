from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.routes.routes import router

from app.config import settings
from app.dependencies import get_db

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)
app.include_router(router)

@app.get("/")
def read_root() -> dict[str, str]:
    return{
        "message":settings.app_name,
        }

@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "Database connection is healthy"}