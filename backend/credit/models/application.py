from mongoengine import Document, ReferenceField, StringField, IntField, FloatField, DateTimeField, DictField
from .client import Client
import datetime

class CreditApplication(Document):
    """Demande de crédit basée sur German Credit Dataset"""
    meta = {'collection': 'credit_applications'}
    
    # Référence au client
    client = ReferenceField(Client, reverse_delete_rule=2, required=True)
    
    # Informations du crédit
    credit_amount = FloatField(required=True, min_value=0)
    duration = IntField(required=True, min_value=1)  # en mois
    purpose = StringField(required=True, choices=[
        'car',
        'radio/TV',
        'furniture/equipment',
        'education',
        'business',
        'domestic appliances',
        'repairs',
        'vacation/others'
    ])
    
    # Évaluation du risque
    risk = StringField(choices=['good', 'bad', 'pending'], default='pending')
    risk_score = FloatField(min_value=0, max_value=100)  # Score de risque en %
    interest_rate = FloatField() # Taux d'intérêt calculé
    analysis_details = DictField() # Détails de l'analyse (facteurs)
    
    # Statut de la demande
    status = StringField(choices=['pending', 'approved', 'rejected'], default='pending')
    
    # Dates
    submission_date = DateTimeField(default=datetime.datetime.utcnow)
    evaluation_date = DateTimeField()
    
    # Commentaire de l'évaluateur
    evaluator_comment = StringField()
    
    def __str__(self):
        return f"Application {self.credit_amount}€ - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.submission_date:
            self.submission_date = datetime.datetime.utcnow()
        return super(CreditApplication, self).save(*args, **kwargs)