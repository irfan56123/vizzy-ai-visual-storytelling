from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    visual_style = models.CharField(
        max_length=200,
        blank=True
    )

    art_style = models.CharField(
        max_length=200,
        blank=True
    )

    mood = models.CharField(
        max_length=200,
        blank=True
    )

    color_palette = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name