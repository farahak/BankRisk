# backend/credit/serializers/application_serializers.py
from rest_framework import serializers
from credit.models.application import CreditApplication
from credit.models.client import Client
import datetime

class CreditApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    client_id = serializers.CharField(write_only=True, required=False)
    client = serializers.SerializerMethodField(read_only=True)
    credit_amount = serializers.FloatField(min_value=0)
    duration = serializers.IntegerField(min_value=1)
    purpose = serializers.ChoiceField(choices=[
        'car',
        'radio/TV',
        'furniture/equipment',
        'education',
        'business',
        'domestic appliances',
        'repairs',
        'vacation/others'
    ])
    risk = serializers.ChoiceField(
        choices=['good', 'bad', 'pending'],
        default='pending',
        read_only=True
    )
    risk_score = serializers.FloatField(read_only=True, allow_null=True)
    status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected'],
        default='pending'
    )
    submission_date = serializers.DateTimeField(read_only=True)
    evaluation_date = serializers.DateTimeField(read_only=True, allow_null=True)
    evaluator_comment = serializers.CharField(required=False, allow_blank=True)
    
    def get_client(self, obj):
        if obj.client:
            return {
                'id': str(obj.client.id),
                'user_email': obj.client.user_email or '',
                'age': obj.client.age,
                'sex': obj.client.sex,
            }
        return None
    
    def create(self, validated_data):
        client_id = validated_data.pop('client_id', None)
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
                validated_data['client'] = client
            except Client.DoesNotExist:
                raise serializers.ValidationError("Client not found")
        
        application = CreditApplication(**validated_data)
        application.save()
        return application
    
    def update(self, instance, validated_data):
        validated_data.pop('client_id', None)  # Ne pas mettre à jour le client
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'client': self.get_client(instance),
            'credit_amount': instance.credit_amount,
            'duration': instance.duration,
            'purpose': instance.purpose,
            'risk': instance.risk,
            'risk_score': instance.risk_score,
            'status': instance.status,
            'submission_date': instance.submission_date.isoformat() if instance.submission_date else None,
            'evaluation_date': instance.evaluation_date.isoformat() if instance.evaluation_date else None,
            'evaluator_comment': instance.evaluator_comment or '',
        }