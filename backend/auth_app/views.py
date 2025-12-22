import logging
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print(f"--- Tentative d'inscription pour: {request.data.get('email')} ---")
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                print("✅ Utilisateur créé avec succès dans MongoDB")
                return Response({
                    "message": "Utilisateur créé avec succès",
                    "user": {
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    }
                }, status=status.HTTP_201_CREATED)
            
            print(f"❌ Erreurs de validation: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error_str = str(e)
            print(f"🔥 ERREUR lors de l'inscription: {error_str}")
            
            # Gérer les doublons MongoDB comme des erreurs 400
            if "duplicate key error" in error_str:
                return Response(
                    {"error": "Cet adresse email est déjà utilisée."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            traceback.print_exc()
            return Response({"error": error_str}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            print(f"--- 🔑 Tentative de connexion: {email} ---")
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                
                # Créer le token manuellement avec l'ID MongoDB
                refresh = RefreshToken()
                refresh['user_id'] = str(user.id)
                refresh['email'] = user.email
                refresh['is_staff'] = user.is_staff
                
                print(f"✅ Connexion réussie pour: {user.email} (Staff={user.is_staff})")
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff
                    }
                }, status=status.HTTP_200_OK)

            print(f"❌ Erreurs de validation Login: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"🔥 ERREUR CRITIQUE Login: {str(e)}")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)