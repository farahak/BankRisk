# backend/credit/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.client_views import ClientViewSet
from .views.application_views import CreditApplicationViewSet
from .views.stats_views import StatsViewSet
from .views.message_views import MessageViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'applications', CreditApplicationViewSet, basename='application')
router.register(r'stats', StatsViewSet, basename='stats')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'attachments', AttachmentViewSet, basename='attachment')


urlpatterns = [
    path('', include(router.urls)),
]