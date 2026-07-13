from datetime import datetime

from pydantic import BaseModel, ConfigDict



class DocumentCreate(BaseModel):
    filename: str
    file_type: str
    original_text: str
    summary: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    original_text: str
    summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UploadDocumentResponse(BaseModel):
    message: str
    document: DocumentResponse

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str

# --- Auth / RBAC schemas ---

from app.models.models import UserRole


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: int | None = None


class RoleUpdate(BaseModel):
    role: UserRole
