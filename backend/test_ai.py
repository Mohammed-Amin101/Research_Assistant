from app.ai import summarize_text

text = """
FastAPI is a modern Python framework for building APIs.
It provides automatic documentation and high performance.
It is widely used for AI backends.
"""

summary = summarize_text(text)

print(summary)