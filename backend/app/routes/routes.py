from pathlib import Path
from typing import List
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.ai import answer_question, summarize_text
from app.crud import crud
from app.dependencies import get_current_user, get_db, require_admin
from app.models.models import User
from app.parser import extract_text
from app.schemas.schemas import (
    AnswerResponse,
    DocumentCreate,
    DocumentResponse,
    QuestionRequest,
    UploadDocumentResponse,
)

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {
    ".txt",
    ".pdf",
    ".docx",
}

# All document routes require a logged-in user (any role). Deleting a
# document additionally requires the admin role — see require_admin below.


@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are allowed.",
        )
    unique_filename = f"{uuid.uuid4()}{Path(file.filename).suffix}"
    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        extracted_text = extract_text(file_path)
        summary = summarize_text(extracted_text)

    except Exception as e:
        import traceback
        print(f"ERROR in document processing: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}",
        )
    MAX_CHARACTERS = 12000

    if len(extracted_text) > MAX_CHARACTERS:
        extracted_text = extracted_text[:MAX_CHARACTERS]

    document = crud.create_document(
        db=db,
        filename=file.filename,
        file_type=file.filename.split(".")[-1],
        original_text=extracted_text,
        summary=summary,
    )

    return {
        "message": "Document uploaded successfully.",
        "document": document,
    }


@router.post(
    "/",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_document(
        db=db,
        filename=document.filename,
        file_type=document.file_type,
        original_text=document.original_text,
        summary=document.summary,
    )


@router.post(
    "/{document_id}/ask",
    response_model=AnswerResponse,
)
def ask_question(
    document_id: int,
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    answer = answer_question(
        document.original_text,
        request.question,
    )

    return {
        "answer": answer,
    }


@router.get("/", response_model=List[DocumentResponse])
def get_all_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_documents(db)


@router.get(
    "/search",
    response_model=List[DocumentResponse],
)
def search_documents(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.search_documents(db, query)


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    crud.delete_document(db, document)

    return {
        "message": "Document deleted successfully.",
    }


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return document
