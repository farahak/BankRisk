# backend/credit/views/application_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.application import CreditApplication
from ..models.client import Client
from ..serializers.application_serializers import CreditApplicationSerializer
from ..serializers.client_serializers import ClientSerializer
import datetime
import logging

logger = logging.getLogger(__name__)

class CreditApplicationViewSet(viewsets.ViewSet):
    """CRUD pour les demandes de crédit"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Liste toutes les demandes"""
        try:
            applications = CreditApplication.objects.all().order_by('-submission_date')
            serializer = CreditApplicationSerializer(applications, many=True)
            logger.info(f"Retrieved {len(serializer.data)} applications")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing applications: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération des demandes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """Récupère une demande par ID"""
        try:
            application = CreditApplication.objects.get(id=pk)
            serializer = CreditApplicationSerializer(application)
            return Response(serializer.data)
        except CreditApplication.DoesNotExist:
            return Response(
                {"error": "Demande non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving application {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération de la demande: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Récupère les demandes d'un client"""
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {"error": "client_id requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            client = Client.objects.get(id=client_id)
            applications = CreditApplication.objects(client=client).order_by('-submission_date')
            serializer = CreditApplicationSerializer(applications, many=True)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(
                {"error": "Client non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting applications for client {client_id}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération des demandes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request):
        """Crée une nouvelle demande de crédit"""
        try:
            data = request.data.copy()
            user_email = request.user.email if hasattr(request, 'user') else None
            
            # Vérifier si le client existe ou le créer
            client = None
            if 'client_id' in data:
                try:
                    client = Client.objects.get(id=data['client_id'])
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Client non trouvé"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif user_email:
                try:
                    client = Client.objects.get(user_email=user_email)
                except Client.DoesNotExist:
                    # Créer un nouveau client si les données sont fournies
                    if 'age' in data and 'sex' in data and 'job' in data and 'housing' in data:
                        client_data = {
                            'user_email': user_email,
                            'age': data.pop('age'),
                            'sex': data.pop('sex'),
                            'job': data.pop('job'),
                            'housing': data.pop('housing'),
                            'saving_accounts': data.pop('saving_accounts', 'NA'),
                            'checking_account': data.pop('checking_account', 'NA'),
                        }
                        client_serializer = ClientSerializer(data=client_data)
                        if client_serializer.is_valid():
                            client = client_serializer.save()
                            logger.info(f"Created new client for {user_email}")
                        else:
                            return Response(
                                {"error": "Données client invalides", "details": client_serializer.errors},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    else:
                        return Response(
                            {"error": "Client non trouvé et données insuffisantes pour créer un profil"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            if not client:
                return Response(
                    {"error": "Client requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Créer la demande
            data['client_id'] = str(client.id)
            serializer = CreditApplicationSerializer(data=data)
            
            if serializer.is_valid():
                application = serializer.save()
                logger.info(f"Created new application: {application.id} for client {client.id}")
                return Response(
                    CreditApplicationSerializer(application).data,
                    status=status.HTTP_201_CREATED
                )
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating application: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la création de la demande: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        """Évalue une demande (Admin seulement)"""
        try:
            application = CreditApplication.objects.get(id=pk)
            
            # Mettre à jour le statut
            application.status = request.data.get('status', application.status)
            application.risk = request.data.get('risk', application.risk)
            application.risk_score = request.data.get('risk_score', application.risk_score)
            application.evaluator_comment = request.data.get('evaluator_comment', '')
            application.evaluation_date = datetime.datetime.utcnow()
            application.save()
            
            logger.info(f"Evaluated application {pk}: status={application.status}, risk={application.risk}")
            
            serializer = CreditApplicationSerializer(application)
            return Response(serializer.data)
            
        except CreditApplication.DoesNotExist:
            return Response(
                {"error": "Demande non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error evaluating application {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de l'évaluation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, pk=None):
        """Supprime une demande"""
        try:
            application = CreditApplication.objects.get(id=pk)
            application.delete()
            logger.info(f"Deleted application: {pk}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CreditApplication.DoesNotExist:
            return Response(
                {"error": "Demande non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting application {pk}: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la suppression: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )