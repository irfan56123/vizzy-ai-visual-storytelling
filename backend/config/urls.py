from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/projects/",
        include("projects.urls")
    ),

    path(
        "api/scenes/",
        include("stories.urls")
    ),

    path(
        "api/generations/",
        include("generations.urls")
    ),
]


urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)