# backend/credit/models/client.py
from mongoengine import Document, StringField, IntField, FloatField, DateTimeField
import datetime

class Client(Document):
    """Client avec informations du German Credit Dataset"""
    meta = {'collection': 'clients'}
    
    # Informations personnelles
    user_email = StringField(required=False)  # Lié au compte utilisateur
    age = IntField(required=True, min_value=18, max_value=100)
    sex = StringField(required=True, choices=['male', 'female'])
    
    # Informations professionnelles
    job = IntField(required=True, min_value=0, max_value=3)
    # 0: unemployed/unskilled non-resident
    # 1: unskilled resident
    # 2: skilled employee/official
    # 3: highly skilled employee/management
    
    # Informations de logement
    housing = StringField(required=True, choices=['own', 'rent', 'free'])
    
    # Informations financières
    saving_accounts = StringField(choices=['little', 'moderate', 'quite rich', 'rich', 'NA'], default='NA')
    checking_account = StringField(choices=['little', 'moderate', 'rich', 'NA'], default='NA')
    
    # Date de création
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    
    def __str__(self):
        return f"Client {self.age} ans - {self.sex}"
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(Client, self).save(*args, **kwargs)