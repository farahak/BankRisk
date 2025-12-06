# credit/views/scoring_views.py
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from ..models.scoring import Scoring
from ..serializers.scoring_serializers import ScoringSerializer

class ScoringViewSet(viewsets.ViewSet):
  
    #permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        scorings = Scoring.objects.all()
        serializer = ScoringSerializer(scorings, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            scoring = Scoring.objects.get(id=pk)
        except Scoring.DoesNotExist:
            return Response({"error": "Scoring not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ScoringSerializer(scoring)
        return Response(serializer.data)

    def create(self, request):
        serializer = ScoringSerializer(data=request.data)
        if serializer.is_valid():
            scoring = serializer.save()
            return Response(ScoringSerializer(scoring).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            scoring = Scoring.objects.get(id=pk)
        except Scoring.DoesNotExist:
            return Response({"error": "Scoring not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ScoringSerializer(data=request.data)
        if serializer.is_valid():
            for attr, value in serializer.validated_data.items():
                setattr(scoring, attr, value)
            scoring.save()
            return Response(ScoringSerializer(scoring).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            scoring = Scoring.objects.get(id=pk)
        except Scoring.DoesNotExist:
            return Response({"error": "Scoring not found"}, status=status.HTTP_404_NOT_FOUND)
        scoring.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
