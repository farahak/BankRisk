# backend/credit/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.client_views import ClientViewSet
from .views.application_views import CreditApplicationViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'applications', CreditApplicationViewSet, basename='application')


urlpatterns = [
    path('', include(router.urls)),
]