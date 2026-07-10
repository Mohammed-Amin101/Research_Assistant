from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_txt(file_path: Path) -> str:

    return file_path.read_text(encoding="utf-8")


def extract_pdf(file_path: Path) -> str:

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def extract_docx(file_path: Path) -> str:
 
    document = Document(file_path)

    return "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
    )


def extract_text(file_path: Path) -> str:


    suffix = file_path.suffix.lower()

    if suffix == ".txt":
        return extract_txt(file_path)

    if suffix == ".pdf":
        return extract_pdf(file_path)

    if suffix == ".docx":
        return extract_docx(file_path)

    raise ValueError(f"Unsupported file type: {suffix}")