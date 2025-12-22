# backend/credit/views/message_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, Http404
from django.core.exceptions import ValidationError
from ..models.message import Message, Attachment
from ..models.application import CreditApplication
from ..serializers.message_serializers import (
    MessageSerializer,
    MessageCreateSerializer,
    MessageThreadSerializer,
    AttachmentSerializer
)
from ..utils.file_handler import save_attachment, delete_attachment_file
import logging
import os

logger = logging.getLogger(__name__)


class MessageViewSet(viewsets.ViewSet):
    """API pour la gestion des messages"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='conversation/(?P<application_id>[^/.]+)')
    def conversation(self, request, application_id=None):
        """
        Récupère tous les messages d'une demande de crédit (thread complet)
        GET /api/messages/conversation/<application_id>/
        """
        try:
            # Vérifier que l'application existe
            try:
                application = CreditApplication.objects.get(id=application_id)
            except CreditApplication.DoesNotExist:
                return Response(
                    {"error": "Demande de crédit non trouvée"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Vérifier les permissions
            user_email = request.user.email
            is_admin = request.user.is_staff
            
            # Admin peut tout voir, client ne peut voir que ses propres messages
            if not is_admin and application.client.user_email != user_email:
                return Response(
                    {"error": "Accès non autorisé"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer tous les messages de cette application
            messages = Message.objects.filter(application=application).order_by('created_at')
            
            # Marquer les messages reçus comme lus
            for msg in messages:
                if msg.recipient_email == user_email and not msg.is_read:
                    msg.mark_as_read()
            
            serializer = MessageThreadSerializer(messages, many=True)
            
            logger.info(f"Retrieved {len(messages)} messages for application {application_id}")
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error retrieving conversation: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération de la conversation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request):
        """
        Envoie un nouveau message avec pièces jointes optionnelles
        POST /api/messages/
        """
        try:
            # Valider les données du message
            serializer = MessageCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Créer le message
            message_data = {
                'application_id': validated_data['application_id'],
                'subject': validated_data.get('subject', ''),
                'content': validated_data['content'],
            }
            
            # Si c'est une réponse, ajouter le parent
            if validated_data.get('parent_message_id'):
                try:
                    parent = Message.objects.get(id=validated_data['parent_message_id'])
                    message_data['parent_message'] = parent
                except Message.DoesNotExist:
                    return Response(
                        {"error": "Message parent non trouvé"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            msg_serializer = MessageSerializer(data=message_data, context={'request': request})
            if not msg_serializer.is_valid():
                return Response(msg_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            message = msg_serializer.save()
            
            # Traiter les pièces jointes
            files = request.FILES.getlist('attachments')
            attachments = []
            
            for file in files:
                try:
                    attachment = save_attachment(file, request.user.email, message)
                    attachments.append(attachment)
                    logger.info(f"Attachment saved: {attachment.filename}")
                except ValidationError as ve:
                    # Supprimer le message si l'upload échoue
                    message.delete()
                    return Response(
                        {"error": f"Erreur de validation du fichier: {str(ve)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Mettre à jour le message avec les attachments
            if attachments:
                message.attachments = attachments
                message.save()
            
            # Retourner le message complet
            response_serializer = MessageSerializer(message)
            logger.info(f"Message created: {message.id} with {len(attachments)} attachments")
            
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating message: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la création du message: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """
        Répond à un message existant
        POST /api/messages/<id>/reply/
        """
        try:
            # Récupérer le message parent
            try:
                parent_message = Message.objects.get(id=pk)
            except Message.DoesNotExist:
                return Response(
                    {"error": "Message non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Créer la réponse
            reply_data = {
                'application_id': str(parent_message.application.id),
                'content': request.data.get('content'),
                'parent_message_id': str(parent_message.id),
                'subject': f"Re: {parent_message.subject}" if parent_message.subject else "Re: Message"
            }
            
            # Utiliser la méthode create pour gérer la réponse
            request._full_data = reply_data
            return self.create(request)
            
        except Exception as e:
            logger.error(f"Error replying to message: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la réponse: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """
        Marque un message comme lu
        PATCH /api/messages/<id>/mark_read/
        """
        try:
            message = Message.objects.get(id=pk)
            
            # Vérifier que c'est le destinataire
            if message.recipient_email != request.user.email:
                return Response(
                    {"error": "Accès non autorisé"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            message.mark_as_read()
            
            serializer = MessageSerializer(message)
            return Response(serializer.data)
            
        except Message.DoesNotExist:
            return Response(
                {"error": "Message non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return Response(
                {"error": f"Erreur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Compte les messages non lus pour l'utilisateur connecté
        GET /api/messages/unread_count/
        """
        try:
            user_email = request.user.email
            count = Message.objects.filter(
                recipient_email=user_email,
                is_read=False
            ).count()
            
            return Response({'unread_count': count})
            
        except Exception as e:
            logger.error(f"Error counting unread messages: {str(e)}")
            return Response(
                {"error": f"Erreur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AttachmentViewSet(viewsets.ViewSet):
    """API pour la gestion des pièces jointes"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Télécharge une pièce jointe
        GET /api/attachments/<id>/download/
        """
        try:
            attachment = Attachment.objects.get(id=pk)
            message = attachment.message
            
            # Vérifier les permissions
            user_email = request.user.email
            is_admin = request.user.is_staff
            application = message.application
            
            # Admin peut tout télécharger, client seulement ses messages
            if not is_admin and application.client.user_email != user_email:
                return Response(
                    {"error": "Accès non autorisé"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Vérifier que le fichier existe
            if not os.path.exists(attachment.file_path):
                logger.error(f"File not found: {attachment.file_path}")
                raise Http404("Fichier non trouvé")
            
            # Retourner le fichier
            response = FileResponse(
                open(attachment.file_path, 'rb'),
                content_type=attachment.mime_type
            )
            response['Content-Disposition'] = f'attachment; filename="{attachment.filename}"'
            
            logger.info(f"File downloaded: {attachment.filename} by {user_email}")
            return response
            
        except Attachment.DoesNotExist:
            return Response(
                {"error": "Pièce jointe non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error downloading attachment: {str(e)}")
            return Response(
                {"error": f"Erreur lors du téléchargement: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, pk=None):
        """
        Supprime une pièce jointe (admin seulement)
        DELETE /api/attachments/<id>/
        """
        try:
            # Vérifier que c'est un admin
            if not request.user.is_staff:
                return Response(
                    {"error": "Accès non autorisé. Admin seulement."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            attachment = Attachment.objects.get(id=pk)
            file_path = attachment.file_path
            
            # Supprimer le fichier du système
            delete_attachment_file(file_path)
            
            # Supprimer l'objet de la base
            attachment.delete()
            
            logger.info(f"Attachment deleted: {file_path}")
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Attachment.DoesNotExist:
            return Response(
                {"error": "Pièce jointe non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting attachment: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la suppression: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
