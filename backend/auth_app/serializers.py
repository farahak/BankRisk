from rest_framework import serializers
from .models import CustomUser

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # Crée un utilisateur MongoEngine
        user = CustomUser(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Récupère l'utilisateur depuis MongoDB
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Utilisateur non trouvé.")

        if not user.check_password(password):
            raise serializers.ValidationError("Mot de passe incorrect.")

        if not user.is_active:
            raise serializers.ValidationError("Utilisateur désactivé.")

        attrs['user'] = user
        return attrs
