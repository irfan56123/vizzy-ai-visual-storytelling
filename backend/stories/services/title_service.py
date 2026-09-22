from groq import Groq


DEFAULT_PROJECT_NAME = "Untitled Visual Story"


def _fallback_title(user_message: str) -> str:
    """
    Reliable fallback title generation.

    This is used when the Groq title request fails
    or returns an empty response.
    """

    message = (
        user_message
        or ""
    ).strip()

    lower_message = message.lower()

    # --------------------------------------------------------
    # Known story patterns
    # --------------------------------------------------------

    if (
        "cyberpunk" in lower_message
        and "detective" in lower_message
        and "tokyo" in lower_message
    ):
        return "Cyberpunk Detective Tokyo"

    if (
        "soldier" in lower_message
        and "war" in lower_message
    ):
        return "Soldier Returns Home"

    if (
        "fantasy" in lower_message
        and "prince" in lower_message
    ):
        return "The Lost Prince"

    if (
        "space" in lower_message
        and "detective" in lower_message
    ):
        return "Space Detective Mystery"

    if (
        "hacker" in lower_message
        and "tokyo" in lower_message
    ):
        return "Tokyo Hacker Mystery"

    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    words = message.split()

    # Remove very common conversational words.
    ignored_words = {
        "create",
        "make",
        "write",
        "generate",
        "give",
        "a",
        "an",
        "the",
        "story",
        "about",
        "with",
        "for",
        "and",
        "of",
        "in",
        "on",
        "to",
        "i",
        "want",
        "me",
        "please",
    }

    meaningful_words = []

    for word in words:

        cleaned = (
            word
            .strip(
                ".,!?;:\"'()[]{}"
            )
        )

        if not cleaned:
            continue

        if cleaned.lower() in ignored_words:
            continue

        meaningful_words.append(
            cleaned
        )

        if len(meaningful_words) >= 4:
            break

    if meaningful_words:

        title = " ".join(
            meaningful_words
        )

        # Capitalize words naturally.
        title = " ".join(
            word.capitalize()
            for word in title.split()
        )

        return title

    return DEFAULT_PROJECT_NAME


def generate_project_title(
    client: Groq,
    user_message: str,
) -> str:
    """
    Generate a short cinematic project title using Groq.

    Returns a fallback title if Groq fails or returns
    an empty response.
    """

    try:

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": """
You generate short titles for visual stories.

Rules:

- Return ONLY the title.
- Use 3 to 6 words.
- Make it meaningful and cinematic.
- Do not use quotes.
- Do not use emojis.
- Do not add punctuation at the beginning or end.
- Do not explain anything.
- Do not write "Title:".

Examples:

User:
Create a cyberpunk detective story set in Tokyo with a mysterious hacker.

Output:
Cyberpunk Detective Tokyo

User:
I want a story about a soldier returning home after war.

Output:
Soldier Returns Home

User:
Create a fantasy story about a lost prince.

Output:
The Lost Prince
""",
                },
                {
                    "role": "user",
                    "content": (
                        user_message
                        or ""
                    ).strip(),
                },
            ],

            temperature=0.2,
            max_completion_tokens=40,
        )

        raw_title = (
            completion
            .choices[0]
            .message
            .content
            or ""
        ).strip()

        print(
            "RAW PROJECT TITLE RESPONSE:",
            repr(raw_title),
        )

        title = (
            raw_title
            .replace('"', "")
            .replace("'", "")
            .replace("\n", " ")
            .strip()
        )

        # Remove accidental "Title:" prefix.
        if title.lower().startswith(
            "title:"
        ):
            title = title[6:].strip()

        # ----------------------------------------------------
        # Validate word count
        # ----------------------------------------------------

        words = title.split()

        if len(words) > 6:
            title = " ".join(
                words[:6]
            )

        if len(words) < 2:
            print(
                "Generated title was too short."
            )

            return _fallback_title(
                user_message
            )

        if not title:
            return _fallback_title(
                user_message
            )

        return title

    except Exception as error:

        print(
            "Project title generation failed:",
            repr(error),
        )

        return _fallback_title(
            user_message
        )


def maybe_update_project_title(
    project,
    client: Groq,
    user_message: str,
    is_first_user_message: bool,
):
    """
    Generate and persist the project title only for
    the first user message of a new project.
    """

    if not is_first_user_message:
        return project

    if (
        project.name
        != DEFAULT_PROJECT_NAME
    ):
        return project

    generated_title = generate_project_title(
        client=client,
        user_message=user_message,
    )

    if (
        not generated_title
        or generated_title
        == DEFAULT_PROJECT_NAME
    ):
        print(
            "Project title remained unchanged."
        )

        return project

    project.name = generated_title

    project.save(
        update_fields=[
            "name",
            "updated_at",
        ]
    )

    print(
        "PROJECT TITLE UPDATED:",
        project.name,
    )

    return project