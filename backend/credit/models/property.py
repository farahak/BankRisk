# backend/credit/models/property.py
from mongoengine import Document, ReferenceField, StringField, IntField
from .client import Client

class Property(Document):
    client = ReferenceField(Client, reverse_delete_rule=2)
    property_type = StringField(max_length=10)   # A121–A124
    housing = StringField(max_length=10)         # A151–A153
    other_installment_plans = StringField(max_length=10)  # A141–A143
    liability_responsibles = IntField(default=1)

    def __str__(self):
        return f"Property of {self.client.name}"
