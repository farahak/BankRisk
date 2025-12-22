# backend/credit/serializers/message_serializers.py
from rest_framework import serializers
from ..models.message import Message, Attachment
from ..models.application import CreditApplication
from datetime import datetime

class AttachmentSerializer(serializers.Serializer):
    """Serializer pour les pièces jointes"""
    id = serializers.CharField(read_only=True)
    filename = serializers.CharField()
    file_size = serializers.IntegerField()
    file_size_display = serializers.SerializerMethodField()
    mime_type = serializers.CharField()
    uploaded_by = serializers.CharField()
    upload_date = serializers.DateTimeField(read_only=True)
    download_url = serializers.SerializerMethodField()
    
    def get_file_size_display(self, obj):
        """Retourne la taille formatée"""
        return obj.get_file_size_display()
    
    def get_download_url(self, obj):
        """Retourne l'URL de téléchargement"""
        return f"/api/attachments/{obj.id}/download/"


class MessageSerializer(serializers.Serializer):
    """Serializer pour les messages avec attachments"""
    id = serializers.CharField(read_only=True)
    application = serializers.SerializerMethodField()
    application_id = serializers.CharField(write_only=True, required=True)
    sender_email = serializers.EmailField(read_only=True)
    sender_type = serializers.CharField(read_only=True)
    recipient_email = serializers.EmailField(read_only=True)
    subject = serializers.CharField(max_length=200, required=False, allow_blank=True)
    content = serializers.CharField(max_length=5000, required=True)
    parent_message = serializers.CharField(required=False, allow_null=True)
    thread_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    read_at = serializers.DateTimeField(read_only=True, allow_null=True)
    is_read = serializers.BooleanField(read_only=True)
    attachments = serializers.SerializerMethodField()
    
    def get_application(self, obj):
        """Retourne l'ID de l'application"""
        return str(obj.application.id) if obj.application else None
    
    def get_attachments(self, obj):
        """Sérialise les attachments"""
        if obj.attachments:
            return AttachmentSerializer(obj.attachments, many=True).data
        return []
    
    def create(self, validated_data):
        """Crée un nouveau message"""
        application_id = validated_data.pop('application_id')
        
        try:
            application = CreditApplication.objects.get(id=application_id)
        except CreditApplication.DoesNotExist:
            raise serializers.ValidationError({'application_id': 'Demande de crédit non trouvée'})
        
        # Déterminer le sender depuis le contexte (request.user)
        request = self.context.get('request')
        sender_email = request.user.email if request and hasattr(request, 'user') else 'unknown'
        
        # Déterminer le type d'expéditeur (admin ou client)
        from auth_app.models import CustomUser
        try:
            user = CustomUser.objects.get(email=sender_email)
            sender_type = 'admin' if user.is_staff else 'client'
        except CustomUser.DoesNotExist:
            sender_type = 'client'
        
        # Déterminer le destinataire
        if sender_type == 'admin':
            recipient_email = application.client.user_email
        else:
            recipient_email = 'admin@bankrisk.com'
        
        # Si c'est une réponse, utiliser le thread_id du parent
        parent = validated_data.pop('parent_message', None)
        if parent:
            try:
                parent_msg = Message.objects.get(id=parent)
                validated_data['thread_id'] = parent_msg.thread_id
                validated_data['parent_message'] = parent_msg
            except Message.DoesNotExist:
                pass
        
        validated_data['application'] = application
        validated_data['sender_email'] = sender_email
        validated_data['sender_type'] = sender_type
        validated_data['recipient_email'] = recipient_email
        
        # Créer le message
        message = Message(**validated_data)
        message.save()
        
        return message
    
    def update(self, instance, validated_data):
        """Met à jour un message existant"""
        # Pour l'instant, on ne permet pas la modification
        return instance


class MessageCreateSerializer(serializers.Serializer):
    """Serializer pour créer un message avec fichiers"""
    application_id = serializers.CharField(required=True)
    subject = serializers.CharField(max_length=200, required=False, allow_blank=True)
    content = serializers.CharField(max_length=5000, required=True)
    parent_message_id = serializers.CharField(required=False, allow_null=True)
    
    def validate_application_id(self, value):
        """Valide que l'application existe"""
        try:
            CreditApplication.objects.get(id=value)
        except CreditApplication.DoesNotExist:
            raise serializers.ValidationError("Demande de crédit non trouvée")
        return value
    
    def validate_parent_message_id(self, value):
        """Valide que le message parent existe"""
        if value:
            try:
                Message.objects.get(id=value)
            except Message.DoesNotExist:
                raise serializers.ValidationError("Message parent non trouvé")
        return value


class MessageThreadSerializer(serializers.Serializer):
    """Serializer pour afficher un thread de conversation"""
    id = serializers.CharField(read_only=True)
    sender_email = serializers.EmailField()
    sender_type = serializers.CharField()
    recipient_email = serializers.EmailField()
    subject = serializers.CharField(allow_blank=True, allow_null=True)
    content = serializers.CharField()
    created_at = serializers.DateTimeField()
    read_at = serializers.DateTimeField(allow_null=True)
    is_read = serializers.BooleanField()
    attachments = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    def get_attachments(self, obj):
        """Sérialise les attachments"""
        if obj.attachments:
            return AttachmentSerializer(obj.attachments, many=True).data
        return []
    
    def get_replies_count(self, obj):
        """Compte le nombre de réponses"""
        return Message.objects.filter(parent_message=obj).count()


