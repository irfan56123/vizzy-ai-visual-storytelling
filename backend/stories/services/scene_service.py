import json

from groq import Groq

from ..models import Scene, ChatMessage


MODEL_NAME = "openai/gpt-oss-20b"


SCENE_EXTRACTION_PROMPT = """
You are Vizzy's storyboard scene readiness engine.

Your job is to determine whether the conversation
contains enough CONFIRMED information to create
ONE storyboard scene.

You must be conservative.

Do NOT create a scene just because Vizzy mentioned
or suggested a possible scene.

Only use information that has been confirmed by
the user or already exists in the project.

============================================================
CORE SCENE REQUIREMENTS
============================================================

A storyboard scene requires these three core elements:

1. Main character or subject
2. Setting / location
3. Visible action, event, or specific moment

All three should be sufficiently clear.

The project may already provide:

- Visual style
- Art style
- Mood
- Color palette

These project values can be used for the scene.

============================================================
WHEN CREATE_SCENE MUST BE FALSE
============================================================

Return:

create_scene = false

when:

- The user only gives a broad idea.
- The main character or subject is missing.
- The setting is missing.
- The action is missing.
- Vizzy is asking a clarification question.
- Vizzy is collecting information.
- The conversation is still developing the concept.
- Creating the scene would require inventing a major story detail.
- Vizzy merely suggested an example scene.
- Vizzy proposed hypothetical details that the user
  has not confirmed.

============================================================
EXTREMELY IMPORTANT:
QUESTION DETECTION
============================================================

If Vizzy's latest response asks the user a question,
create_scene MUST be false.

Examples:

Vizzy:
"What kind of detective is at the center of the story?"

FALSE

Vizzy:
"Where does the story begin?"

FALSE

Vizzy:
"What is the detective doing in this scene?"

FALSE

Even if the response contains visual examples,
those examples are NOT confirmed story facts.

============================================================
CONVERSATION MEMORY
============================================================

Information can be collected across multiple messages.

Example:

User:
"I want a detective story."

Vizzy:
"What kind of detective is at the center?"

User:
"A young private detective."

Vizzy:
"Where does the story begin?"

User:
"Tokyo at midnight."

Vizzy:
"What is the detective doing?"

User:
"He is investigating a murder."

Now the confirmed information is:

Subject:
young private detective

Location:
Tokyo at midnight

Action:
investigating a murder

Therefore:

create_scene = true

============================================================
DO NOT INVENT
============================================================

Do NOT invent important details such as:

- murder
- chase
- weapon
- costume
- weather
- time
- personality
- supporting characters
- objects

unless they were confirmed by the user
or already established by the project.

============================================================
COMPLETE PROMPT
============================================================

If the user directly provides a complete
cinematic/image-generation prompt containing
enough visual information:

create_scene = true

Do not ask unnecessary questions.

============================================================
TITLE
============================================================

When create_scene = true:

Generate a short cinematic title.

3 to 7 words.

Examples:

"Rain Over Tokyo"
"The Last Train"
"Midnight Investigation"
"Into the Forest"
"Arrival at the Station"

Never return an empty title.

============================================================
DESCRIPTION
============================================================

When create_scene = true:

Create a detailed visual description suitable
for an AI image-generation model.

Include confirmed information about:

- Main subject
- Characters
- Environment
- Location
- Action
- Camera perspective
- Composition
- Lighting
- Color palette
- Mood
- Atmosphere
- Important objects
- Background elements
- Visual style

Do NOT invent major story facts.

The description must be visually useful
for image generation.

============================================================
DIALOGUE
============================================================

If confirmed dialogue exists:

include it.

Otherwise:

return an empty string.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

The JSON must contain:

create_scene
title
description
dialogue
"""


def extract_scene_data(
    client: Groq,
    project,
    history,
):
    """
    Analyze the COMPLETE conversation and determine
    whether enough confirmed information exists to
    create a storyboard scene.
    """

    # ========================================================
    # BUILD COMPLETE CONVERSATION
    # ========================================================

    conversation_parts = []

    for item in history:

        conversation_parts.append(
            f"{item.role.upper()}: {item.content}"
        )

    conversation = "\n\n".join(
        conversation_parts
    )

    # ========================================================
    # GROQ SCENE EXTRACTION
    # ========================================================

    completion = client.chat.completions.create(

        model=MODEL_NAME,

        messages=[
            {
                "role": "system",
                "content": SCENE_EXTRACTION_PROMPT,
            },
            {
                "role": "user",
                "content": f"""
CURRENT PROJECT:

Title:
{project.name}

Description:
{project.description}

Visual style:
{project.visual_style}

Art style:
{project.art_style}

Mood:
{project.mood}

Color palette:
{project.color_palette}


COMPLETE CONVERSATION:

{conversation}
""",
            },
        ],

        response_format={
            "type": "json_schema",

            "json_schema": {
                "name": "scene_extraction",

                "strict": True,

                "schema": {
                    "type": "object",

                    "properties": {

                        "create_scene": {
                            "type": "boolean",
                        },

                        "title": {
                            "type": "string",
                        },

                        "description": {
                            "type": "string",
                        },

                        "dialogue": {
                            "type": "string",
                        },
                    },

                    "required": [
                        "create_scene",
                        "title",
                        "description",
                        "dialogue",
                    ],

                    "additionalProperties": False,
                },
            },
        },

        temperature=0.1,

        max_completion_tokens=1000,
    )

    content = (
        completion
        .choices[0]
        .message
        .content
    )

    print(
        "RAW SCENE EXTRACTION:",
        content,
    )

    scene_data = json.loads(
        content
    )

    print(
        "PARSED SCENE DATA:",
        scene_data,
    )

    return scene_data


def create_scene_from_data(
    project,
    scene_data: dict,
):
    """
    Create a Scene database object from
    extracted scene data.
    """

    # ========================================================
    # CHECK READINESS
    # ========================================================

    if not scene_data.get(
        "create_scene"
    ):
        return None

    # ========================================================
    # TITLE
    # ========================================================

    title = (
        scene_data.get(
            "title"
        )
        or ""
    ).strip()

    if not title:

        title = (
            "New Storyboard Scene"
        )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description = (
        scene_data.get(
            "description"
        )
        or ""
    ).strip()

    if not description:

        print(
            "Scene rejected: empty description."
        )

        return None

    # ========================================================
    # DIALOGUE
    # ========================================================

    dialogue = (
        scene_data.get(
            "dialogue"
        )
        or ""
    ).strip()

    # ========================================================
    # NEXT SCENE ORDER
    # ========================================================

    last_scene = (
        Scene.objects
        .filter(
            project=project
        )
        .order_by(
            "-order"
        )
        .first()
    )

    if last_scene:

        next_order = (
            last_scene.order + 1
        )

    else:

        next_order = 1

    # ========================================================
    # CREATE SCENE
    # ========================================================

    scene = Scene.objects.create(

        project=project,

        title=title,

        description=description,

        dialogue=dialogue,

        order=next_order,

        status="empty",
    )

    print(
        "STORYBOARD SCENE CREATED:",
        scene.id,
        scene.title,
    )

    return scene


def extract_and_create_scene(
    client: Groq,
    project,
    user_message: str,
    assistant_content: str,
):
    """
    Complete scene extraction workflow.

    The latest messages are already stored in the database
    before this function is called, so we fetch the complete
    project conversation here.
    """

    try:

        # ====================================================
        # GET COMPLETE CHAT HISTORY
        # ====================================================

        history = (
            ChatMessage.objects
            .filter(
                project=project
            )
            .order_by(
                "created_at"
            )
        )

        # ====================================================
        # EXTRACT SCENE DATA
        # ====================================================

        scene_data = extract_scene_data(
            client=client,
            project=project,
            history=history,
        )

        # ====================================================
        # CREATE SCENE ONLY WHEN READY
        # ====================================================

        return create_scene_from_data(
            project=project,
            scene_data=scene_data,
        )

    except Exception as error:

        print(
            "Scene extraction error:",
            error,
        )

        return None