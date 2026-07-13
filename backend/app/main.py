from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_db
from app.routes.auth_routes import router as auth_router
from app.routes.routes import router as documents_router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)

# CORS configuration - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(documents_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": settings.app_name,
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Database connection is healthy"}
    except Exception as e:
        return {"status": f"Database error: {str(e)}"}
