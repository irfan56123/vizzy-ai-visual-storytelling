from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project
from .serializers import ProjectSerializer


class ProjectListCreateView(APIView):

    def get(self, request):
        projects = Project.objects.all().order_by("-created_at")

        serializer = ProjectSerializer(
            projects,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(
            data=request.data
        )

        if serializer.is_valid():
            project = serializer.save()

            return Response(
                ProjectSerializer(project).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProjectDetailView(APIView):

    def get_object(self, project_id):
        try:
            return Project.objects.get(
                id=project_id
            )
        except Project.DoesNotExist:
            return None

    def get(self, request, project_id):
        project = self.get_object(project_id)

        if project is None:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(project)

        return Response(serializer.data)

    def put(self, request, project_id):
        project = self.get_object(project_id)

        if project is None:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(
            project,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, project_id):
        project = self.get_object(project_id)

        if project is None:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        project.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )