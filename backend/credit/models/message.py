# backend/credit/models/message.py
from mongoengine import Document, StringField, DateTimeField, BooleanField, ReferenceField, ListField, IntField
from datetime import datetime
import uuid

class Message(Document):
    """
    Modèle pour les messages entre admin et clients
    """
    # Identifiants
    application = ReferenceField('CreditApplication', required=True)
    sender_email = StringField(required=True, max_length=255)
    sender_type = StringField(choices=['admin', 'client'], required=True)
    recipient_email = StringField(required=True, max_length=255)
    
    # Contenu
    subject = StringField(max_length=200)
    content = StringField(required=True, max_length=5000)
    
    # Thread (conversation)
    parent_message = ReferenceField('self', null=True)
    thread_id = StringField(default=lambda: str(uuid.uuid4()))
    
    # Métadonnées
    created_at = DateTimeField(default=datetime.utcnow)
    read_at = DateTimeField(null=True)
    is_read = BooleanField(default=False)
    
    # Relations
    attachments = ListField(ReferenceField('Attachment'))
    
    meta = {
        'collection': 'messages',
        'indexes': [
            'application',
            'thread_id',
            'sender_email',
            'recipient_email',
            'created_at',
            ('application', '-created_at'),  # Index composé pour tri
            ('recipient_email', 'is_read'),  # Pour les messages non lus
        ],
        'ordering': ['-created_at']
    }
    
    def __str__(self):
        return f"Message from {self.sender_email} - {self.subject or 'No subject'}"
    
    def mark_as_read(self):
        """Marque le message comme lu"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            self.save()


class Attachment(Document):
    """
    Modèle pour les pièces jointes PDF
    """
    # Fichier
    filename = StringField(required=True, max_length=255)  # Nom original
    file_path = StringField(required=True, max_length=500)  # Chemin sur le serveur
    file_size = IntField(required=True)  # Taille en bytes
    mime_type = StringField(default='application/pdf', max_length=100)
    
    # Sécurité
    uploaded_by = StringField(required=True, max_length=255)
    upload_date = DateTimeField(default=datetime.utcnow)
    
    # Relation
    message = ReferenceField('Message', required=True)
    
    meta = {
        'collection': 'attachments',
        'indexes': [
            'message',
            'uploaded_by',
            'upload_date'
        ],
        'ordering': ['upload_date']
    }
    
    def __str__(self):
        return f"{self.filename} ({self.file_size} bytes)"
    
    def get_file_size_display(self):
        """Retourne la taille du fichier en format lisible"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
