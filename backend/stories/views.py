import os

from django.shortcuts import get_object_or_404

from groq import Groq

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project

from .models import Scene, ChatMessage
from .serializers import SceneSerializer

from .services.ai_service import generate_ai_response

from .services.title_service import (
    maybe_update_project_title,
)

from .services.scene_service import (
    extract_and_create_scene,
)


# ============================================================
# SCENE LIST + CREATE
# ============================================================


class SceneListCreateView(APIView):

    # --------------------------------------------------------
    # GET SCENES
    # --------------------------------------------------------

    def get(self, request):

        project_id = request.query_params.get(
            "project"
        )

        scenes = Scene.objects.all()

        if project_id:

            scenes = scenes.filter(
                project_id=project_id
            )

        serializer = SceneSerializer(
            scenes,
            many=True,
        )

        return Response(
            serializer.data
        )

    # --------------------------------------------------------
    # CREATE SCENE
    # --------------------------------------------------------

    def post(self, request):

        serializer = SceneSerializer(
            data=request.data
        )

        if serializer.is_valid():

            scene = serializer.save()

            return Response(
                SceneSerializer(scene).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# SCENE DETAIL
# ============================================================


class SceneDetailView(APIView):

    def get_object(self, scene_id):

        try:

            return Scene.objects.get(
                id=scene_id
            )

        except Scene.DoesNotExist:

            return None

    # --------------------------------------------------------
    # GET SCENE
    # --------------------------------------------------------

    def get(
        self,
        request,
        scene_id,
    ):

        scene = self.get_object(
            scene_id
        )

        if scene is None:

            return Response(
                {
                    "error": "Scene not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SceneSerializer(
            scene
        )

        return Response(
            serializer.data
        )

    # --------------------------------------------------------
    # UPDATE SCENE
    # --------------------------------------------------------

    def put(
        self,
        request,
        scene_id,
    ):

        scene = self.get_object(
            scene_id
        )

        if scene is None:

            return Response(
                {
                    "error": "Scene not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SceneSerializer(
            scene,
            data=request.data,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # PATCH SCENE
    # --------------------------------------------------------

    def patch(
        self,
        request,
        scene_id,
    ):

        scene = self.get_object(
            scene_id
        )

        if scene is None:

            return Response(
                {
                    "error": "Scene not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SceneSerializer(
            scene,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # DELETE SCENE
    # --------------------------------------------------------

    def delete(
        self,
        request,
        scene_id,
    ):

        scene = self.get_object(
            scene_id
        )

        if scene is None:

            return Response(
                {
                    "error": "Scene not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        scene.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# AI CHAT
# ============================================================


class ChatView(APIView):

    # --------------------------------------------------------
    # GET CHAT HISTORY
    # --------------------------------------------------------

    def get(self, request):

        project_id = request.query_params.get(
            "project_id"
        )

        if not project_id:

            return Response(
                {
                    "error":
                        "project_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = get_object_or_404(
            Project,
            id=project_id,
        )

        chat_messages = (
            ChatMessage.objects
            .filter(
                project=project
            )
            .order_by(
                "created_at"
            )
        )

        messages = [
            {
                "id": item.id,
                "role": item.role,
                "content": item.content,
                "created_at": item.created_at,
            }
            for item in chat_messages
        ]

        return Response(
            {
                "project_id": project.id,
                "messages": messages,
            },
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # POST CHAT MESSAGE
    # --------------------------------------------------------

    def post(
        self,
        request,
    ):

        # ====================================================
        # VALIDATE REQUEST
        # ====================================================

        project_id = request.data.get(
            "project_id"
        )

        message = request.data.get(
            "message"
        )

        if not project_id:

            return Response(
                {
                    "error":
                        "project_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message or not message.strip():

            return Response(
                {
                    "error":
                        "message is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ====================================================
        # GET PROJECT
        # ====================================================

        project = get_object_or_404(
            Project,
            id=project_id,
        )

        # ====================================================
        # CHECK FIRST USER MESSAGE
        # ====================================================

        is_first_user_message = not (
            ChatMessage.objects
            .filter(
                project=project,
                role="user",
            )
            .exists()
        )

        # ====================================================
        # SAVE USER MESSAGE
        # ====================================================

        user_message = ChatMessage.objects.create(
            project=project,
            role="user",
            content=message.strip(),
        )

        # ====================================================
        # GROQ API KEY
        # ====================================================

        api_key = os.getenv(
            "GROQ_API_KEY"
        )

        if not api_key:

            return Response(
                {
                    "error":
                        "GROQ_API_KEY is not configured"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:

            # =================================================
            # GROQ CLIENT
            # =================================================

            client = Groq(
                api_key=api_key
            )

            # =================================================
            # AUTO PROJECT TITLE
            # =================================================

            maybe_update_project_title(
                project=project,
                client=client,
                user_message=message,
                is_first_user_message=(
                    is_first_user_message
                ),
            )

            # -------------------------------------------------
            # IMPORTANT
            # Reload project from database so the latest
            # generated title is guaranteed to be available.
            # -------------------------------------------------

            project.refresh_from_db()

            print(
                "CURRENT PROJECT TITLE:",
                project.name,
            )

            # =================================================
            # CONVERSATION HISTORY
            # =================================================

            history = (
                ChatMessage.objects
                .filter(
                    project=project
                )
                .order_by(
                    "created_at"
                )
            )

            # =================================================
            # GENERATE VIZZY RESPONSE
            # =================================================

            assistant_content = generate_ai_response(
                client=client,
                project=project,
                history=history,
            )

            # =================================================
            # SAVE ASSISTANT RESPONSE
            # =================================================

            assistant_message = (
                ChatMessage.objects.create(
                    project=project,
                    role="assistant",
                    content=assistant_content,
                )
            )

            # =================================================
            # EXTRACT STORYBOARD SCENE
            # =================================================

            created_scene = (
                extract_and_create_scene(
                    client=client,
                    project=project,
                    user_message=message,
                    assistant_content=assistant_content,
                )
            )

            # =================================================
            # FINAL RESPONSE
            # =================================================

            return Response(
                {
                    "project": {
                        "id": project.id,
                        "name": project.name,
                    },

                    "user_message": {
                        "id":
                            user_message.id,

                        "role":
                            user_message.role,

                        "content":
                            user_message.content,

                        "created_at":
                            user_message.created_at,
                    },

                    "assistant_message": {
                        "id":
                            assistant_message.id,

                        "role":
                            assistant_message.role,

                        "content":
                            assistant_message.content,

                        "created_at":
                            assistant_message.created_at,
                    },

                    "scene": (
                        {
                            "id":
                                created_scene.id,

                            "title":
                                created_scene.title,

                            "description":
                                created_scene.description,

                            "dialogue":
                                created_scene.dialogue,

                            "order":
                                created_scene.order,

                            "status":
                                created_scene.status,

                            "image_url":
                                created_scene.image_url,
                        }

                        if created_scene

                        else None
                    ),
                },

                status=status.HTTP_200_OK,
            )

        # =====================================================
        # GROQ ERROR
        # =====================================================

        except Exception as error:

            print(
                "Groq error:",
                repr(error),
            )

            return Response(
                {
                    "error":
                        "AI response failed",

                    "details":
                        str(error),
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================
# APPROVE SCENE
# ============================================================


class ApproveSceneView(APIView):

    def post(
        self,
        request,
        scene_id,
    ):

        scene = get_object_or_404(
            Scene,
            id=scene_id,
        )

        scene.approved = True

        scene.save(
            update_fields=[
                "approved",
                "updated_at",
            ]
        )

        return Response(
            {
                "success": True,

                "message":
                    "Scene approved successfully.",

                "scene": {
                    "id":
                        scene.id,

                    "title":
                        scene.title,

                    "approved":
                        scene.approved,

                    "image_url":
                        scene.image_url,
                },
            },

            status=status.HTTP_200_OK,
        )