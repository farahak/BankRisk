# backend/credit/serializers/client_serializers.py
from rest_framework import serializers
from credit.models.client import Client
import datetime

class ClientSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(required=False, allow_blank=True)
    age = serializers.IntegerField(min_value=18, max_value=100)
    sex = serializers.ChoiceField(choices=['male', 'female'])
    job = serializers.IntegerField(min_value=0, max_value=3)
    housing = serializers.ChoiceField(choices=['own', 'rent', 'free'])
    saving_accounts = serializers.ChoiceField(
        choices=['little', 'moderate', 'quite rich', 'rich', 'NA'],
        default='NA'
    )
    checking_account = serializers.ChoiceField(
        choices=['little', 'moderate', 'rich', 'NA'],
        default='NA'
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def create(self, validated_data):
        client = Client(**validated_data)
        client.save()
        return client
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.updated_at = datetime.datetime.utcnow()
        instance.save()
        return instance
    
    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'user_email': instance.user_email or '',
            'age': instance.age,
            'sex': instance.sex,
            'job': instance.job,
            'housing': instance.housing,
            'saving_accounts': instance.saving_accounts,
            'checking_account': instance.checking_account,
            'created_at': instance.created_at.isoformat() if instance.created_at else None,
            'updated_at': instance.updated_at.isoformat() if instance.updated_at else None,
        }