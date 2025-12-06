# backend/credit/views/client_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.client import Client
from ..serializers.client_serializers import ClientSerializer
import logging

logger = logging.getLogger(__name__)

class ClientViewSet(viewsets.ViewSet):
    """CRUD pour les clients"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Liste tous les clients"""
        try:
            clients = Client.objects.all().order_by('-created_at')
            serializer = ClientSerializer(clients, many=True)
            logger.info(f"Retrieved {len(serializer.data)} clients")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing clients: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération des clients: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """Récupère un client par ID"""
        try:
            client = Client.objects.get(id=pk)
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(
                {"error": "Client non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving client {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération du client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_email(self, request):
        """Récupère un client par email"""
        email = request.query_params.get('email')
        if not email:
            return Response(
                {"error": "Email requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            client = Client.objects.get(user_email=email)
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(
                {"error": "Client non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting client by email {email}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération du client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request):
        """Crée un nouveau client"""
        try:
            serializer = ClientSerializer(data=request.data)
            if serializer.is_valid():
                client = serializer.save()
                logger.info(f"Created new client: {client.id}")
                return Response(
                    ClientSerializer(client).data,
                    status=status.HTTP_201_CREATED
                )
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating client: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la création du client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, pk=None):
        """Met à jour un client"""
        try:
            client = Client.objects.get(id=pk)
            serializer = ClientSerializer(client, data=request.data)
            if serializer.is_valid():
                client = serializer.save()
                logger.info(f"Updated client: {client.id}")
                return Response(ClientSerializer(client).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Client.DoesNotExist:
            return Response(
                {"error": "Client non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating client {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la mise à jour du client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, pk=None):
        """Supprime un client"""
        try:
            client = Client.objects.get(id=pk)
            client.delete()
            logger.info(f"Deleted client: {pk}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Client.DoesNotExist:
            return Response(
                {"error": "Client non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting client {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la suppression du client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )