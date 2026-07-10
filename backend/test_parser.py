from pathlib import Path

from app.parser import extract_text

file_path = Path("uploads/sample.txt")

print(extract_text(file_path))