from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Document


def create_document(
    db: Session,
    filename: str,
    file_type: str,
    original_text: str,
    summary: str,
) -> Document:
   

    document = Document(
        filename=filename,
        file_type=file_type,
        original_text=original_text,
        summary=summary,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

def get_documents(db: Session) -> list[Document]:
  

    return (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .all()
    )
def get_document(
    db: Session,
    document_id: int,
) -> Document | None:


    return (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )
def delete_document(
    db: Session,
    document: Document,
) -> None:


    db.delete(document)
    db.commit()

def search_documents(
    db: Session,
    query: str,
) -> list[Document]:

    return (
        db.query(Document)
        .filter(
            or_(
                Document.filename.ilike(f"%{query}%"),
                Document.original_text.ilike(f"%{query}%"),
                Document.summary.ilike(f"%{query}%"),
            )
        )
        .order_by(Document.created_at.desc())
        .all()
    )