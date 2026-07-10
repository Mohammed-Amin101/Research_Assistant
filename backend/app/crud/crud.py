from sqlalchemy.orm import Session

from app.models.models import Document


def create_document(
    db: Session,
    filename: str,
    file_type: str,
    original_text: str,
    summary: str,
) -> Document:
    """
    Create a new document record.
    """

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
    """
    Return all documents ordered by newest first.
    """

    return (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .all()
    )
def get_document(
    db: Session,
    document_id: int,
) -> Document | None:
    """
    Return one document by ID.
    """

    return (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )
def delete_document(
    db: Session,
    document: Document,
) -> None:
    """
    Delete a document.
    """

    db.delete(document)
    db.commit()