# backend/auth_app/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import CustomUser

class MongoJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT personnalisée pour MongoDB
    """
    
    def get_user(self, validated_token):
        """
        Récupère l'utilisateur depuis MongoDB en utilisant l'ID du token
        """
        try:
            user_id = validated_token.get('user_id')
            if user_id is None:
                raise InvalidToken('Token ne contient pas user_id')
            
            # Récupérer l'utilisateur depuis MongoDB
            user = CustomUser.objects.get(id=user_id)
            return user
            
        except CustomUser.DoesNotExist:
            raise InvalidToken('Utilisateur non trouvé')
        except Exception as e:
            raise InvalidToken(f'Erreur lors de la récupération de l\'utilisateur: {str(e)}')