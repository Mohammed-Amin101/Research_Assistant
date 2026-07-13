from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Document, User, UserRole
from app.security import hash_password


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

# --- User CRUD ---

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
) -> User:
    # The very first user to register becomes an admin automatically so
    # there's always at least one admin able to manage roles. Everyone
    # after that defaults to the "user" role.
    is_first_user = db.query(User).first() is None
    role = UserRole.ADMIN if is_first_user else UserRole.USER

    user = User(
        email=email.lower().strip(),
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user_role(db: Session, user: User, role: UserRole) -> User:
    user.role = role
    db.commit()
    db.refresh(user)
    return user
