from django.urls import path

from .views import (
    GenerateImageView,
    GenerateImageOptionsView,
)

urlpatterns = [
    path(
        "generate/",
        GenerateImageView.as_view(),
        name="generate-image",
    ),

    path(
        "generate-options/",
        GenerateImageOptionsView.as_view(),
        name="generate-image-options",
    ),
]