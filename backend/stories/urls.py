from django.urls import path

from .views import (
    SceneListCreateView,
    SceneDetailView,
    ChatView,
    ApproveSceneView,
)


urlpatterns = [
    path(
        "",
        SceneListCreateView.as_view()
    ),

    path(
        "<int:scene_id>/",
        SceneDetailView.as_view()
    ),

    path(
        "chat/",
        ChatView.as_view()
    ),

    path(
        "<int:scene_id>/approve/",
        ApproveSceneView.as_view()
    ),
]