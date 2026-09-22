from django.db import models

from projects.models import Project
from stories.models import Scene


class ImageGeneration(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("generating", "Generating"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="image_generations",
    )

    scene = models.ForeignKey(
        Scene,
        on_delete=models.CASCADE,
        related_name="image_generations",
    )

    prompt = models.TextField()

    image_url = models.URLField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    error_message = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.scene.title} - {self.status}"