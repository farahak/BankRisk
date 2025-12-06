# backend/credit/models/financial.py
from mongoengine import Document, ReferenceField, StringField, FloatField, IntField
from .client import Client

class Financial(Document):
    client = ReferenceField(Client, reverse_delete_rule=2, unique=True)
    checking_account_status = StringField(max_length=10)  # A11–A14
    savings_account_bonds = StringField(max_length=10)    # A61–A65
    credit_amount = FloatField()
    duration_in_month = IntField()
    installment = IntField()
    other_debtors = StringField(max_length=10)  # A101–A103

    def __str__(self):
        return f"Financial info for {self.client.name}"
