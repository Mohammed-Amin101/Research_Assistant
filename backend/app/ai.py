from groq import Groq

from app.config import settings

client = Groq(
    api_key=settings.groq_api_key,
)

def summarize_text(text: str) -> str:


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


def answer_question(document_text: str, question: str) -> str:

    prompt = f"""
You are an AI Research Assistant.

Answer the user's question ONLY using the document below.

If the answer is not present, reply:
"I couldn't find that information in the document."

Document:
{document_text}

Question:
{question}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content