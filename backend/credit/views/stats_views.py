# backend/credit/views/stats_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.application import CreditApplication
from ..models.client import Client
from ..serializers.application_serializers import CreditApplicationSerializer
import logging

logger = logging.getLogger(__name__)

class StatsViewSet(viewsets.ViewSet):
    """Optimized statistics endpoints for dashboard"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Optimized dashboard statistics endpoint.
        Returns pre-calculated stats without loading all records into memory.
        """
        try:
            # Use efficient database aggregation queries
            total_clients = Client.objects.count()
            total_applications = CreditApplication.objects.count()
            
            # Status counts
            approved = CreditApplication.objects.filter(status='approved').count()
            pending = CreditApplication.objects.filter(status='pending').count()
            rejected = CreditApplication.objects.filter(status='rejected').count()
            
            # Risk counts
            good_risk = CreditApplication.objects.filter(risk='good').count()
            bad_risk = CreditApplication.objects.filter(risk='bad').count()
            
            # Recent applications (limit to 5 for dashboard preview)
            recent_applications = CreditApplication.objects.all().order_by('-submission_date')[:5]
            recent_apps_serialized = CreditApplicationSerializer(recent_applications, many=True).data
            
            stats = {
                'totalClients': total_clients,
                'totalApplications': total_applications,
                'approved': approved,
                'pending': pending,
                'rejected': rejected,
                'goodRisk': good_risk,
                'badRisk': bad_risk,
                'recentApplications': recent_apps_serialized,
            }
            
            logger.info(f"Dashboard stats retrieved: {total_applications} applications, {total_clients} clients")
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error retrieving dashboard stats: {str(e)}")
            return Response(
                {"error": f"Erreur lors de la récupération des statistiques: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
