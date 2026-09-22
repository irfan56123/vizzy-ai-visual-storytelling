import base64
import json
import os
import uuid
import urllib.request

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from stories.models import Scene

from .models import ImageGeneration


# ============================================================
# GENERATE SINGLE IMAGE
# ============================================================


class GenerateImageView(APIView):

    def post(self, request):

        scene_id = request.data.get(
            "scene_id"
        )

        if not scene_id:

            return Response(
                {
                    "error":
                        "scene_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        scene = get_object_or_404(
            Scene,
            id=scene_id,
        )

        project = scene.project

        account_id = os.getenv(
            "CLOUDFLARE_ACCOUNT_ID"
        )

        api_token = os.getenv(
            "CLOUDFLARE_API_TOKEN"
        )

        if not account_id or not api_token:

            return Response(
                {
                    "error":
                        "Cloudflare credentials are not configured"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        prompt = f"""
Create a cinematic storyboard frame for a visual graphic novel.

Project:
{project.name}

Visual style:
{project.visual_style}

Art style:
{project.art_style}

Mood:
{project.mood}

Color palette:
{project.color_palette}

Scene title:
{scene.title}

Scene description:
{scene.description}

Dialogue:
{scene.dialogue or "None"}

Requirements:
- cinematic composition
- strong visual storytelling
- detailed characters and environment
- consistent color palette
- dramatic lighting
- polished graphic-novel aesthetic
- no text
- no captions
- no speech bubbles
- no watermark
- single scene
- no collage
"""

        generation = ImageGeneration.objects.create(
            project=project,
            scene=scene,
            prompt=prompt,
            status="generating",
        )

        scene.status = "generating"

        scene.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        try:

            url = (
                f"https://api.cloudflare.com/client/v4/"
                f"accounts/{account_id}/ai/run/"
                f"@cf/black-forest-labs/flux-1-schnell"
            )

            payload = json.dumps(
                {
                    "prompt": prompt,
                }
            ).encode("utf-8")

            request_object = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Authorization":
                        f"Bearer {api_token}",

                    "Content-Type":
                        "application/json",
                },
                method="POST",
            )

            with urllib.request.urlopen(
                request_object,
                timeout=120,
            ) as response:

                response_data = json.loads(
                    response.read().decode("utf-8")
                )

            if not response_data.get(
                "success"
            ):

                raise RuntimeError(
                    str(
                        response_data.get(
                            "errors"
                        )
                    )
                )

            result = response_data.get(
                "result",
                {}
            )

            image_base64 = result.get(
                "image"
            )

            if not image_base64:

                raise RuntimeError(
                    "Cloudflare did not return image data."
                )

            image_bytes = base64.b64decode(
                image_base64
            )

            filename = (
                f"scene_{scene.id}_"
                f"{uuid.uuid4().hex}.png"
            )

            file_path = (
                f"generated/{filename}"
            )

            saved_path = default_storage.save(
                file_path,
                ContentFile(image_bytes),
            )

            relative_image_url = (
                default_storage.url(
                    saved_path
                )
            )

            image_url = (
                request.build_absolute_uri(
                    relative_image_url
                )
            )

            generation.status = "completed"

            generation.image_url = image_url

            generation.save()

            scene.image_url = image_url

            scene.status = "completed"

            scene.save(
                update_fields=[
                    "image_url",
                    "status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "success": True,

                    "generation": {
                        "id":
                            generation.id,

                        "status":
                            generation.status,

                        "image_url":
                            generation.image_url,
                    },

                    "scene": {
                        "id":
                            scene.id,

                        "title":
                            scene.title,

                        "status":
                            scene.status,

                        "image_url":
                            scene.image_url,
                    },
                },

                status=status.HTTP_200_OK,
            )

        except Exception as error:

            print(
                "Cloudflare image generation error:",
                error,
            )

            generation.status = "failed"

            generation.error_message = str(
                error
            )

            generation.save()

            scene.status = "empty"

            scene.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "success": False,

                    "error":
                        "Image generation failed",

                    "details":
                        str(error),

                    "generation_id":
                        generation.id,
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================
# GENERATE MULTIPLE IMAGE OPTIONS
# ============================================================


class GenerateImageOptionsView(APIView):

    def post(self, request):

        scene_id = request.data.get(
            "scene_id"
        )

        try:
            count = int(
                request.data.get(
                    "count",
                    3,
                )
            )

        except (TypeError, ValueError):

            count = 3

        if not scene_id:

            return Response(
                {
                    "error":
                        "scene_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        count = max(
            1,
            min(count, 3)
        )

        scene = get_object_or_404(
            Scene,
            id=scene_id,
        )

        project = scene.project

        account_id = os.getenv(
            "CLOUDFLARE_ACCOUNT_ID"
        )

        api_token = os.getenv(
            "CLOUDFLARE_API_TOKEN"
        )

        if not account_id or not api_token:

            return Response(
                {
                    "error":
                        "Cloudflare credentials are not configured"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        prompt = f"""
Create a cinematic storyboard frame for a visual graphic novel.

Project:
{project.name}

Visual style:
{project.visual_style}

Art style:
{project.art_style}

Mood:
{project.mood}

Color palette:
{project.color_palette}

Scene title:
{scene.title}

Scene description:
{scene.description}

Dialogue:
{scene.dialogue or "None"}

Requirements:
- cinematic composition
- strong visual storytelling
- detailed characters and environment
- consistent color palette
- dramatic lighting
- polished graphic-novel aesthetic
- no text
- no captions
- no speech bubbles
- no watermark
- single scene
- no collage
"""

        generated_images = []

        try:

            for index in range(count):

                generation = (
                    ImageGeneration.objects.create(
                        project=project,
                        scene=scene,
                        prompt=prompt,
                        status="generating",
                    )
                )

                url = (
                    f"https://api.cloudflare.com/client/v4/"
                    f"accounts/{account_id}/ai/run/"
                    f"@cf/black-forest-labs/flux-1-schnell"
                )

                payload = json.dumps(
                    {
                        "prompt": prompt
                    }
                ).encode("utf-8")

                request_object = urllib.request.Request(
                    url,
                    data=payload,
                    headers={
                        "Authorization":
                            f"Bearer {api_token}",

                        "Content-Type":
                            "application/json",
                    },
                    method="POST",
                )

                with urllib.request.urlopen(
                    request_object,
                    timeout=120,
                ) as response:

                    response_data = json.loads(
                        response.read().decode(
                            "utf-8"
                        )
                    )

                if not response_data.get(
                    "success"
                ):

                    raise RuntimeError(
                        str(
                            response_data.get(
                                "errors"
                            )
                        )
                    )

                result = response_data.get(
                    "result",
                    {}
                )

                image_base64 = result.get(
                    "image"
                )

                if not image_base64:

                    raise RuntimeError(
                        "Cloudflare did not return image data."
                    )

                image_bytes = base64.b64decode(
                    image_base64
                )

                filename = (
                    f"scene_{scene.id}_"
                    f"option_{index + 1}_"
                    f"{uuid.uuid4().hex}.png"
                )

                file_path = (
                    f"generated/{filename}"
                )

                saved_path = default_storage.save(
                    file_path,
                    ContentFile(image_bytes),
                )

                relative_image_url = (
                    default_storage.url(
                        saved_path
                    )
                )

                image_url = (
                    request.build_absolute_uri(
                        relative_image_url
                    )
                )

                generation.status = "completed"

                generation.image_url = (
                    image_url
                )

                generation.save()

                generated_images.append(
                    {
                        "id":
                            generation.id,

                        "option":
                            index + 1,

                        "image_url":
                            image_url,
                    }
                )

            # =================================================
            # IMPORTANT:
            # Persist first generated image to Scene
            # =================================================

            if generated_images:

                first_image_url = (
                    generated_images[0][
                        "image_url"
                    ]
                )

                scene.image_url = (
                    first_image_url
                )

                scene.status = (
                    "completed"
                )

                # New generated options need approval again.
                scene.approved = False

                scene.save(
                    update_fields=[
                        "image_url",
                        "status",
                        "approved",
                        "updated_at",
                    ]
                )

            return Response(
                {
                    "success": True,

                    "scene_id":
                        scene.id,

                    "images":
                        generated_images,

                    # Useful for frontend
                    "selected_image":
                        (
                            generated_images[0][
                                "image_url"
                            ]
                            if generated_images
                            else None
                        ),
                },

                status=status.HTTP_200_OK,
            )

        except Exception as error:

            print(
                "Multiple image generation error:",
                error,
            )

            scene.status = "empty"

            scene.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "success": False,

                    "error":
                        "Image generation failed",

                    "details":
                        str(error),
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )