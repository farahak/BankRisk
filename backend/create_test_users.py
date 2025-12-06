# backend/create_test_users.py
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bankrisk_backend.settings')
django.setup()

from auth_app.models import CustomUser
from credit.models import Client, Financial, Employment, Property, Application, Scoring

def create_users():
    """Créer les utilisateurs de test"""
    
    print("🔄 Création des utilisateurs de test...")
    
    # Supprimer les utilisateurs existants (optionnel)
    CustomUser.objects.all().delete()
    print("✅ Anciens utilisateurs supprimés")
    
    # 1. CRÉER UN ADMIN
    try:
        admin = CustomUser.objects.get(email='admin@bankrisk.com')
        print("⚠️  Admin existe déjà")
    except CustomUser.DoesNotExist:
        admin = CustomUser(
            email='admin@bankrisk.com',
            first_name='Admin',
            last_name='BankRisk',
            is_staff=True,
            is_active=True
        )
        admin.set_password('admin123')
        admin.save()
        print("✅ Admin créé: admin@bankrisk.com / admin123")
    
    # 2. CRÉER UN CLIENT
    try:
        client_user = CustomUser.objects.get(email='client@bankrisk.com')
        print("⚠️  Client existe déjà")
    except CustomUser.DoesNotExist:
        client_user = CustomUser(
            email='client@bankrisk.com',
            first_name='Jean',
            last_name='Dupont',
            is_staff=False,
            is_active=True
        )
        client_user.set_password('client123')
        client_user.save()
        print("✅ Client créé: client@bankrisk.com / client123")
    
    # 3. CRÉER UN AUTRE CLIENT
    try:
        client_user2 = CustomUser.objects.get(email='marie@bankrisk.com')
        print("⚠️  Marie existe déjà")
    except CustomUser.DoesNotExist:
        client_user2 = CustomUser(
            email='marie@bankrisk.com',
            first_name='Marie',
            last_name='Martin',
            is_staff=False,
            is_active=True
        )
        client_user2.set_password('marie123')
        client_user2.save()
        print("✅ Client créé: marie@bankrisk.com / marie123")
    
    print("\n📊 Résumé des comptes:")
    print("━" * 50)
    print("👨‍💼 ADMIN:")
    print("   Email: admin@bankrisk.com")
    print("   Mot de passe: admin123")
    print("   Rôle: Administrateur")
    print()
    print("👤 CLIENT 1:")
    print("   Email: client@bankrisk.com")
    print("   Mot de passe: client123")
    print("   Rôle: Client")
    print()
    print("👤 CLIENT 2:")
    print("   Email: marie@bankrisk.com")
    print("   Mot de passe: marie123")
    print("   Rôle: Client")
    print("━" * 50)

def create_sample_data():
    """Créer des données de test pour les clients"""
    
    print("\n🔄 Création des données de test...")
    
    # Supprimer les anciennes données
    Client.objects.all().delete()
    Financial.objects.all().delete()
    Employment.objects.all().delete()
    Property.objects.all().delete()
    Application.objects.all().delete()
    Scoring.objects.all().delete()
    
    # Client 1: Mohamed Amine
    client1 = Client(
        name="Mohamed Amine",
        sex_status="A91",
        age_in_years=26,
        telephone="A191",
        foreign_worker="A202"
    )
    client1.save()
    
    financial1 = Financial(
        client=client1,
        checking_account_status="A14",
        savings_account_bonds="A65",
        credit_amount=60000,
        duration_in_month=60,
        installment=2,
        other_debtors="A103"
    )
    financial1.save()
    
    employment1 = Employment(
        client=client1,
        employment_status="A75",
        job_type="A173",
        existing_credits_no=0
    )
    employment1.save()
    
    property1 = Property(
        client=client1,
        property_type="A124",
        housing="A153",
        other_installment_plans="A143",
        liability_responsibles=1
    )
    property1.save()
    
    application1 = Application(
        client=client1,
        purpose="A40",
        credit_history="A30"
    )
    application1.save()
    
    scoring1 = Scoring(
        application=application1,
        score=26.0,
        risk_category="1"
    )
    scoring1.save()
    
    # Client 2: Marie Martin
    client2 = Client(
        name="Marie Martin",
        sex_status="A92",
        age_in_years=35,
        telephone="A191",
        foreign_worker="A202"
    )
    client2.save()
    
    financial2 = Financial(
        client=client2,
        checking_account_status="A12",
        savings_account_bonds="A63",
        credit_amount=75000,
        duration_in_month=72,
        installment=3,
        other_debtors="A103"
    )
    financial2.save()
    
    employment2 = Employment(
        client=client2,
        employment_status="A74",
        job_type="A172",
        existing_credits_no=1
    )
    employment2.save()
    
    property2 = Property(
        client=client2,
        property_type="A122",
        housing="A152",
        other_installment_plans="A143",
        liability_responsibles=2
    )
    property2.save()
    
    application2 = Application(
        client=client2,
        purpose="A42",
        credit_history="A32"
    )
    application2.save()
    
    scoring2 = Scoring(
        application=application2,
        score=62.0,
        risk_category="2"
    )
    scoring2.save()
    
    # Client 3: Pierre Bernard
    client3 = Client(
        name="Pierre Bernard",
        sex_status="A93",
        age_in_years=45,
        telephone="A192",
        foreign_worker="A202"
    )
    client3.save()
    
    financial3 = Financial(
        client=client3,
        checking_account_status="A11",
        savings_account_bonds="A61",
        credit_amount=30000,
        duration_in_month=48,
        installment=4,
        other_debtors="A101"
    )
    financial3.save()
    
    employment3 = Employment(
        client=client3,
        employment_status="A72",
        job_type="A171",
        existing_credits_no=2
    )
    employment3.save()
    
    property3 = Property(
        client=client3,
        property_type="A124",
        housing="A151",
        other_installment_plans="A141",
        liability_responsibles=1
    )
    property3.save()
    
    application3 = Application(
        client=client3,
        purpose="A43",
        credit_history="A34"
    )
    application3.save()
    
    scoring3 = Scoring(
        application=application3,
        score=78.0,
        risk_category="2"
    )
    scoring3.save()
    
    print("✅ 3 clients créés avec leurs données complètes")
    print(f"   - {client1.name} (Score: 26% - Approuvé)")
    print(f"   - {client2.name} (Score: 62% - En attente)")
    print(f"   - {client3.name} (Score: 78% - Rejeté)")

if __name__ == '__main__':
    try:
        create_users()
        create_sample_data()
        print("\n✅ ✅ ✅ Tous les utilisateurs et données ont été créés avec succès! ✅ ✅ ✅\n")
    except Exception as e:
        print(f"\n❌ Erreur: {e}\n")
        import traceback
        traceback.print_exc()