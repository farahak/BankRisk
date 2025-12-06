# backend/auth_app/models.py
from mongoengine import Document, StringField, BooleanField, EmailField
from werkzeug.security import generate_password_hash, check_password_hash

class CustomUser(Document):
    meta = {'collection': 'custom_users'}  # nom de la collection MongoDB

    email = EmailField(required=True, unique=True)
    first_name = StringField(max_length=30)
    last_name = StringField(max_length=30)
    password_hash = StringField(required=True)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)

    
    @property
    def is_authenticated(self):
        return True

    def set_password(self, raw_password):
        """Hash le mot de passe et le stocke"""
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        """Vérifie le mot de passe"""
        return check_password_hash(self.password_hash, raw_password)

    def __str__(self):
        return self.email
