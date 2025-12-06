



# backend/import_german_credit.py
import os
import sys
import django
import pandas as pd

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bankrisk_backend.settings')
django.setup()

from credit.models.client import Client
from credit.models.application import CreditApplication
from auth_app.models import CustomUser

def clean_value(value):
    """Nettoie les valeurs NA"""
    if pd.isna(value) or value == 'NA':
        return 'NA'
    return str(value)

csv_path = 'german_credit_data.csv'

def import_german_credit_data(csv_path):
    """Importe les données du CSV German Credit"""
    
    print("=" * 60)
    print("📥 IMPORTATION DES DONNÉES GERMAN CREDIT DATASET")
    print("=" * 60)
    
    # Supprimer les anciennes données
    print("\n1️⃣  Nettoyage des anciennes données...")
    Client.objects.all().delete()
    CreditApplication.objects.all().delete()
    print("   ✅ Anciennes données supprimées")
    
    # Lire le CSV
    try:
        df = pd.read_csv(csv_path)
        print(f"\n2️⃣  CSV chargé: {len(df)} lignes")
    except FileNotFoundError:
        print(f"\n❌ Fichier non trouvé: {csv_path}")
        print("💡 Assurez-vous que le fichier german_credit_data.csv est dans le dossier backend/")
        return
    
    # Mapping des valeurs
    purpose_mapping = {
        'radio/TV': 'radio/TV',
        'education': 'education',
        'furniture/equipment': 'furniture/equipment',
        'car': 'car',
        'business': 'business',
        'domestic appliances': 'domestic appliances',
        'repairs': 'repairs',
        'vacation/others': 'vacation/others'
    }
    
    created_count = 0
    errors = []
    
    print("\n3️⃣  Importation des données...")
    
    # Importer chaque ligne
    for index, row in df.iterrows():
        try:
            # Créer le client
            client = Client(
                age=int(row['Age']),
                sex=str(row['Sex']).lower(),
                job=int(row['Job']),
                housing=str(row['Housing']).lower(),
                saving_accounts=clean_value(row.get('Saving accounts', 'NA')),
                checking_account=clean_value(row.get('Checking account', 'NA'))
            )
            client.save()
            
            # Créer la demande de crédit
            purpose = str(row['Purpose'])
            if purpose not in purpose_mapping:
                purpose = 'vacation/others'
            
            # Déterminer le statut en fonction du risque
            risk_value = str(row['Risk']).lower()
            status_value = 'approved' if risk_value == 'good' else 'rejected'
            
            application = CreditApplication(
                client=client,
                credit_amount=float(row['Credit amount']),
                duration=int(row['Duration']),
                purpose=purpose,
                risk=risk_value,
                status=status_value
            )
            application.save()
            
            created_count += 1
            
            if (created_count % 100 == 0):
                print(f"   📊 Importé: {created_count}/{len(df)}")
                
        except Exception as e:
            error_msg = f"Ligne {index}: {str(e)}"
            errors.append(error_msg)
            if len(errors) <= 5:  # N'afficher que les 5 premières erreurs
                print(f"   ⚠️  {error_msg}")
    
    print(f"\n4️⃣  Importation terminée!")
    print(f"   ✅ {created_count} clients et demandes créés")
    
    if errors:
        print(f"\n   ⚠️  {len(errors)} erreurs rencontrées")
        if len(errors) > 5:
            print(f"   (Seules les 5 premières sont affichées)")
    
    # Statistiques
    print("\n5️⃣  Statistiques finales:")
    print(f"   📊 Total clients: {Client.objects.count()}")
    print(f"   📊 Total demandes: {CreditApplication.objects.count()}")
    print(f"   ✅ Bon risque: {CreditApplication.objects(risk='good').count()}")
    print(f"   ❌ Mauvais risque: {CreditApplication.objects(risk='bad').count()}")
    print(f"   ✓  Approuvées: {CreditApplication.objects(status='approved').count()}")
    print(f"   ✗  Rejetées: {CreditApplication.objects(status='rejected').count()}")

def create_demo_users():
    """Crée les utilisateurs de démo"""
    print("\n6️⃣  Création des utilisateurs de démo...")
    
    # Supprimer les anciens utilisateurs
    CustomUser.objects.all().delete()
    
    # Admin
    admin = CustomUser(
        email='admin@bankrisk.com',
        first_name='Admin',
        last_name='BankRisk',
        is_staff=True,
        is_active=True
    )
    admin.set_password('admin123')
    admin.save()
    print("   ✅ Admin créé: admin@bankrisk.com / admin123")
    
    # Client 1
    client1 = CustomUser(
        email='client@bankrisk.com',
        first_name='Jean',
        last_name='Dupont',
        is_staff=False,
        is_active=True
    )
    client1.set_password('client123')
    client1.save()
    
    # Créer le profil client associé
    client_profile1 = Client(
        user_email='client@bankrisk.com',
        age=35,
        sex='male',
        job=2,
        housing='own',
        saving_accounts='moderate',
        checking_account='little'
    )
    client_profile1.save()
    print("   ✅ Client 1 créé: client@bankrisk.com / client123")
    
    # Client 2
    client2 = CustomUser(
        email='marie@bankrisk.com',
        first_name='Marie',
        last_name='Martin',
        is_staff=False,
        is_active=True
    )
    client2.set_password('marie123')
    client2.save()
    
    # Créer le profil client associé
    client_profile2 = Client(
        user_email='marie@bankrisk.com',
        age=28,
        sex='female',
        job=3,
        housing='rent',
        saving_accounts='little',
        checking_account='moderate'
    )
    client_profile2.save()
    print("   ✅ Client 2 créé: marie@bankrisk.com / marie123")
    
    # Client 3 - Riche Mohamed Amine
    client3 = CustomUser(
        email='rich@gmail.com',
        first_name='Riche',
        last_name='Mohamed Amine',
        is_staff=False,
        is_active=True
    )
    client3.set_password('rich123')
    client3.save()
    
    # Créer le profil client associé
    client_profile3 = Client(
        user_email='rich@gmail.com',
        age=26,
        sex='male',
        job=3,
        housing='own',
        saving_accounts='rich',
        checking_account='rich'
    )
    client_profile3.save()
    print("   ✅ Client 3 créé: rich@gmail.com / rich123")

if __name__ == '__main__':
    # Chemin vers le CSV
    csv_path = 'german_credit_data.csv'
    
    if not os.path.exists(csv_path):
        print(f"\n❌ Fichier {csv_path} non trouvé!")
        print("💡 Téléchargez german_credit_data.csv et placez-le dans backend/")
        sys.exit(1)
    
    try:
        create_demo_users()
        import_german_credit_data(csv_path)
        print("\n" + "=" * 60)
        print("✅ ✅ ✅ IMPORTATION TERMINÉE AVEC SUCCÈS! ✅ ✅ ✅")
        print("=" * 60)
        print("\n📋 COMPTES DE TEST:")
        print("   👨‍💼 Admin: admin@bankrisk.com / admin123")
        print("   👤 Client 1: client@bankrisk.com / client123")
        print("   👤 Client 2: marie@bankrisk.com / marie123")
        print("   👤 Client 3: rich@gmail.com / rich123")
        print("=" * 60 + "\n")
    except Exception as e:
        print(f"\n❌ Erreur: {e}\n")
        import traceback
        traceback.print_exc()