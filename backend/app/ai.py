import os
from typing import List, Optional

from openai import OpenAI


_client: Optional[OpenAI] = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


def generate_content_suggestions(
    prompt: str,
    recent_events: List[dict],
    lessons: List[dict],
    language: str = "fr",
    model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
) -> str:
    client = get_openai_client()

    events_snippets = [f"- {e.get('title')}: {e.get('description','')[:200]}" for e in recent_events[:5]]
    lessons_snippets = [f"- {l.get('title')}: {l.get('summary','')[:200]}" for l in lessons[:5]]

    system = (
        "Tu es un expert en marketing social media. Propose des idées de contenus "
        "courtes et actionnables pour Instagram Reels, adaptées au public cible, "
        "avec des hooks percutants, des scripts en 3-5 points, et des CTA. "
        "Réponds en "
        + language
        + "."
    )

    context = (
        "Contexte événements récents:\n" + "\n".join(events_snippets) + "\n\n"
        "Contexte leçons (best practices internes):\n" + "\n".join(lessons_snippets)
    )

    messages = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": (
                "Brief utilisateur:\n" + prompt + "\n\n" + context +
                "\n\nFormat attendu: une liste de 3-5 idées."
            ),
        },
    ]

    resp = client.chat.completions.create(model=model, messages=messages)
    return resp.choices[0].message.content or ""



