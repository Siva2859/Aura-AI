"""
===========================================================
Aura AI Chatbot
AI Module (Groq)
===========================================================
"""

try:
    from groq import Groq  # type: ignore[import]
except ImportError as exc:
    raise ImportError(
        "The groq package is required. Install it with `pip install groq`."
    ) from exc

from config import (
    GROQ_API_KEY,
    DEFAULT_MODEL,
    TEMPERATURE,
    MAX_TOKENS,
    TOP_P,
)

# ===========================================================
# CREATE CLIENT
# ===========================================================

client = Groq(api_key=GROQ_API_KEY)


# ===========================================================
# SYSTEM PROMPT
# ===========================================================

SYSTEM_PROMPT = """
You are Aura AI, a professional AI assistant designed to provide accurate, helpful, and well-formatted responses.

==================================================
GENERAL BEHAVIOR
==================================================

- Always be friendly, professional, and respectful.
- Give accurate information.
- If you don't know something, clearly say so.
- Never invent facts.
- Explain concepts in simple language unless the user requests advanced details.
- Keep responses organized and easy to read.
- Avoid unnecessary repetition.

==================================================
RESPONSE FORMATTING
==================================================

Always use proper Markdown.

Rules:

- Use headings (#, ##, ###).
- Leave blank lines between sections.
- Use bullet lists for multiple items.
- Use numbered lists for step-by-step instructions.
- Highlight important terms using **bold**.
- Use tables whenever comparing multiple things.
- Never return one huge paragraph.
- Keep spacing clean.

Example:

# Topic

## Overview

Explanation...

## Key Points

- Point 1
- Point 2
- Point 3

## Summary

Short conclusion.

==================================================
CODING QUESTIONS
==================================================

If the user asks for code, ALWAYS answer using this structure.

# Problem

Brief description.

## Algorithm

Explain the logic in simple words.

## Python Code

```python
# Code here
"""

# ===========================================================
# BUILD CONVERSATION
# ===========================================================

def build_messages(history, user_message):
    """
    Convert stored chat history into the format
    expected by the Groq Chat Completions API.
    """

    messages = [

        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }

    ]

    if history:

        for item in history:

            messages.append(

                {
                    "role": item["role"],
                    "content": item["message"]
                }

            )

    messages.append(

        {
            "role": "user",
            "content": user_message
        }

    )

    return messages


# ===========================================================
# GENERATE RESPONSE
# ===========================================================

def get_ai_response(
    user_message,
    history=None,
    model=None,
    temperature=None,
    max_tokens=None
):
    
    """
    Returns the AI response as plain text.
    """

    try:

        messages = build_messages(
            history,
            user_message
        )

        response = client.chat.completions.create(

            model=model or DEFAULT_MODEL,

            messages=messages,

            temperature=temperature if temperature is not None else TEMPERATURE,

            max_tokens=max_tokens or MAX_TOKENS,

            top_p=TOP_P,

            stream=False

        )

        return response.choices[0].message.content.strip()

    except Exception:

        return (
            "⚠ Sorry, I couldn't generate a response. "
            "Please try again."
        )


# ===========================================================
# STREAMING RESPONSE (Optional)
# ===========================================================

def stream_ai_response(user_message, history=None):
    """
    Streams the AI response token by token.
    Useful for ChatGPT-style typing effects.
    """

    messages = build_messages(
        history,
        user_message
    )

    stream = client.chat.completions.create(

        model=DEFAULT_MODEL,

        messages=messages,

        temperature=TEMPERATURE,

        max_tokens=MAX_TOKENS,

        top_p=TOP_P,

        stream=True

    )

    for chunk in stream:

        if chunk.choices:

            delta = chunk.choices[0].delta.content

            if delta:

                yield delta


# ===========================================================
# QUICK TITLE GENERATION
# ===========================================================

def generate_chat_title(user_message):
    """
    Generates a short chat title
    from the user's first message.
    """

    try:

        response = client.chat.completions.create(

            model=DEFAULT_MODEL,

            messages=[

                {
                    "role": "system",
                    "content": """
You generate chat titles.

Rules:
- Maximum 4 words.
- Do NOT write a sentence.
- Do NOT use punctuation.
- Return ONLY the title.
- Examples:
  Artificial Intelligence
  Binary Search
  Python Functions
  Machine Learning
"""
                },

                {
                    "role": "user",
                    "content": user_message
                }

            ],

            temperature=0.2,

            max_tokens=10

        )

        title = response.choices[0].message.content.strip()

        # Remove quotes if the model adds them
        title = title.replace('"', "").replace("'", "")

        # Limit to 30 characters
        if len(title) > 30:
            title = title[:30] + "..."

        return title

    except Exception:

        # Fallback title
        words = user_message.split()

        return " ".join(words[:4]) if words else "New Chat"

# ===========================================================
# TEST
# ===========================================================

if __name__ == "__main__":

    while True:

        prompt = input("You: ")

        if prompt.lower() == "exit":
            break

        answer = get_ai_response(prompt)

        print("\nAura AI:\n")

        print(answer)

        print()