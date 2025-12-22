# backend/credit/views/application_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models.application import CreditApplication
from ..models.client import Client
from ..serializers.application_serializers import CreditApplicationSerializer
from ..serializers.client_serializers import ClientSerializer
from ..logic import calculate_risk_analysis
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
                
                # --- AI ANALYSIS TRIGGER ---
                try:
                    client_data = {
                        'age': client.age,
                        'sex': client.sex,
                        'job': client.job,
                        'housing': client.housing,
                        'saving_accounts': client.saving_accounts,
                        'checking_account': client.checking_account
                    }
                    app_data = {
                        'credit_amount': application.credit_amount,
                        'duration': application.duration
                    }
                    analysis = calculate_risk_analysis(client_data, app_data)
                    
                    # Update application with AI results
                    application.risk = analysis['risk']
                    application.risk_score = analysis['score']
                    application.interest_rate = analysis['interest_rate']
                    application.analysis_details = analysis
                    application.save()
                    
                    logger.info(f"AI Analysis completed for app {application.id}: Risk={application.risk}, Rate={application.interest_rate}%")
                except Exception as ai_err:
                    logger.error(f"AI Analysis failed: {str(ai_err)}")
                
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
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def estimate_interest(self, request):
        """Estimation en temps réel du taux d'intérêt (sans sauvegarde)"""
        try:
            data = request.data
            logger.info(f"📊 Estimation demandée pour: {data}")
            
            client_data = {
                'age': int(data.get('age', 30)),
                'job': int(data.get('job', 2)),
                'housing': data.get('housing', 'rent'),
                'saving_accounts': data.get('saving_accounts', 'NA'),
            }
            app_data = {
                'credit_amount': float(data.get('credit_amount', 1000)),
                'duration': int(data.get('duration', 12))
            }
            
            analysis = calculate_risk_analysis(client_data, app_data)
            return Response(analysis)
        except Exception as e:
            logger.error(f"❌ Erreur estimation: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
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