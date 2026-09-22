from rest_framework import serializers

from .models import Scene


class SceneSerializer(serializers.ModelSerializer):

    class Meta:
        model = Scene

        fields = [
            "id",
            "project",
            "title",
            "description",
            "dialogue",
            "order",
            "status",
            "image_url",
            "approved",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]