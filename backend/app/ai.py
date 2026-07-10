from groq import Groq

from app.config import settings

client = Groq(
    api_key=settings.groq_api_key,
)


def summarize_text(text: str) -> str:
    """
    Generate a concise summary of the provided document.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert document summarizer. "
                    "Summarize the document in 5-8 clear sentences. "
                    "Preserve the important information while removing unnecessary details."
                ),
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        temperature=0.3,
        max_tokens=500,
    )

    return response.choices[0].message.content.strip()