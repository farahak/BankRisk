# backend/credit/serializers/scoring_serializer.py
from rest_framework import serializers
from credit.models.scoring import Scoring

class ScoringSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    application = serializers.CharField()  #On stocke juste l'ID de l'application
    score = serializers.FloatField()
    risk_category = serializers.CharField()
    model_version = serializers.CharField()
    evaluated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        scoring = Scoring(**validated_data)
        scoring.save()
        return scoring

    def to_representation(self, instance):
        """Convertit l'objet MongoEngine en dictionnaire JSON"""
        return {
            "id": str(instance.id),
            "application": str(instance.application.id) if instance.application else None,
            "score": instance.score,
            "risk_category": instance.risk_category,
            "model_version": instance.model_version,
            "evaluated_at": instance.evaluated_at.isoformat() if instance.evaluated_at else None,
        }
