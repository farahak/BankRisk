# backend/credit/models/scoring.py
from mongoengine import Document, ReferenceField, FloatField, StringField, DateTimeField
from .application import Application
import datetime

class Scoring(Document):
    application = ReferenceField(Application, reverse_delete_rule=2, unique=True)
    score = FloatField(required=True)
    risk_category = StringField(choices=['1', '2'])  # 1 = Good, 2 = Bad
    model_version = StringField(default='v1.0')
    evaluated_at = DateTimeField(default=datetime.datetime.utcnow)

    def __str__(self):
        return f"Score {self.score} - {self.application.client.name}"
