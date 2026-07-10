from fastapi import APIRouter, Depends, HTTPException, status,File, UploadFile
from sqlalchemy.orm import Session
from app.crud import crud
from app.dependencies import get_db
from app.schemas.schemas import DocumentCreate, DocumentResponse,UploadDocumentResponse
from pathlib import Path
from app.parser import extract_text
from app.ai import summarize_text
from app.parser import extract_text
from app.crud import crud
import uuid
from typing import List
from app.ai import answer_question
from app.schemas.schemas import (
    QuestionRequest,
    AnswerResponse,
)

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {
    ".txt",
    ".pdf",
    ".docx",
}

@router.post(
    "/upload",
    response_model=UploadDocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    print("Uploading...")
    from pathlib import Path
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are allowed."
        )
    unique_filename = (
        f"{uuid.uuid4()}{Path(file.filename).suffix}"
    )
    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        extracted_text = extract_text(file_path)
        summary = summarize_text(extracted_text)

    except Exception as e:
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
):

    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    answer = answer_question(
        document.original_text,
        request.question,
    )

    return {
        "answer": answer
    }


@router.get("/", response_model=List[DocumentResponse])
def get_all_documents(
    db: Session = Depends(get_db),
):
    return crud.get_documents(db)

@router.get(
    "/search",
    response_model=List[DocumentResponse],
)
def search_documents(
    query: str,
    db: Session = Depends(get_db),
):
    return crud.search_documents(db, query)

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    crud.delete_document(db, document)

    return {
        "message": "Document deleted successfully."
    }

@router.get(
    "/{document_id}",
    response_model=DocumentResponse
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = crud.get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return document



# def delete_document(
#     document_id: int,
#     db: Session = Depends(get_db),
# ):
#     document = crud.get_document(db, document_id)

#     if document is None:
#         raise HTTPException(
#             status_code=404,
#             detail="Document not found."
#         )

#     crud.delete_document(db, document)

#     return {
#         "message": "Document deleted successfully."
#     }
