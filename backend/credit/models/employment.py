from mongoengine import Document, StringField, IntField, ReferenceField
from .client import Client

class Employment(Document):
    client = ReferenceField(Client, reverse_delete_rule=2)
    employment_status = StringField(max_length=10)  # A71–A75
    job_type = StringField(max_length=10)          # A171–A174
    existing_credits_no = IntField(default=0)

    def __str__(self):
        return f"Employment of {self.client.name}"
