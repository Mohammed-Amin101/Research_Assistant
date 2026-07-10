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