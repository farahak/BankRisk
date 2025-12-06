# backend/check_database.py
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bankrisk_backend.settings')
django.setup()

from credit.models.client import Client
from credit.models.application import CreditApplication
from auth_app.models import CustomUser
from mongoengine import connect

def check_database():
    """Vérifie l'état de la base de données"""
    
    print("=" * 60)
    print("🔍 VÉRIFICATION DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    # 1. Connexion à MongoDB
    print("\n1️⃣  Connexion à MongoDB...")
    try:
        db = connect(db='bankrisk_db', host='mongodb://localhost:27017/bankrisk_db', alias='default')
        connection = db.get_database()
        print("   ✅ Connexion réussie!")
        
        # Lister toutes les collections
        collections = connection.list_collection_names()
        print(f"\n   📋 Collections disponibles ({len(collections)}):")
        for coll in collections:
            count = connection[coll].count_documents({})
            print(f"      - {coll}: {count} documents")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
        return
    
    # 2. Vérifier les modèles Django/MongoEngine
    print("\n2️⃣  Vérification des modèles...")
    try:
        clients_count = Client.objects.count()
        applications_count = CreditApplication.objects.count()
        users_count = CustomUser.objects.count()
        
        print(f"   📊 Clients (via Model): {clients_count}")
        print(f"   📊 Applications (via Model): {applications_count}")
        print(f"   📊 Utilisateurs (via Model): {users_count}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 3. Afficher quelques exemples
    print("\n3️⃣  Exemples de données...")
    
    # Clients
    try:
        clients = Client.objects.limit(3)
        if clients:
            print("\n   👥 Exemples de clients:")
            for client in clients:
                print(f"      - {client.age} ans, {client.sex}, job={client.job}, housing={client.housing}")
        else:
            print("\n   ⚠️  Aucun client trouvé")
    except Exception as e:
        print(f"   ❌ Erreur clients: {e}")
    
    # Applications
    try:
        applications = CreditApplication.objects.limit(3)
        if applications:
            print("\n   💳 Exemples d'applications:")
            for app in applications:
                print(f"      - Montant: {app.credit_amount}€, Durée: {app.duration} mois, Risque: {app.risk}, Statut: {app.status}")
        else:
            print("\n   ⚠️  Aucune application trouvée")
    except Exception as e:
        print(f"   ❌ Erreur applications: {e}")
    
    # Utilisateurs
    try:
        users = CustomUser.objects.limit(5)
        if users:
            print("\n   👤 Exemples d'utilisateurs:")
            for user in users:
                role = "Admin" if user.is_staff else "Client"
                print(f"      - {user.email} ({role})")
        else:
            print("\n   ⚠️  Aucun utilisateur trouvé")
    except Exception as e:
        print(f"   ❌ Erreur utilisateurs: {e}")
    
    # 4. Statistiques détaillées
    print("\n4️⃣  Statistiques détaillées...")
    try:
        good_risk = CreditApplication.objects(risk='good').count()
        bad_risk = CreditApplication.objects(risk='bad').count()
        pending_risk = CreditApplication.objects(risk='pending').count()
        
        approved = CreditApplication.objects(status='approved').count()
        rejected = CreditApplication.objects(status='rejected').count()
        pending_status = CreditApplication.objects(status='pending').count()
        
        print(f"\n   📈 Répartition des risques:")
        print(f"      - Bon risque: {good_risk}")
        print(f"      - Mauvais risque: {bad_risk}")
        print(f"      - En attente: {pending_risk}")
        
        print(f"\n   📊 Répartition des statuts:")
        print(f"      - Approuvé: {approved}")
        print(f"      - Rejeté: {rejected}")
        print(f"      - En attente: {pending_status}")
        
        # Statistiques par objectif
        purposes = CreditApplication.objects.distinct('purpose')
        print(f"\n   🎯 Objectifs de crédit ({len(purposes)}):")
        for purpose in purposes:
            count = CreditApplication.objects(purpose=purpose).count()
            print(f"      - {purpose}: {count}")
        
    except Exception as e:
        print(f"   ❌ Erreur statistiques: {e}")
    
    # 5. Vérifier les liens client-application
    print("\n5️⃣  Vérification des relations...")
    try:
        applications_with_client = 0
        applications_without_client = 0
        
        for app in CreditApplication.objects:
            if app.client:
                applications_with_client += 1
            else:
                applications_without_client += 1
        
        print(f"   🔗 Applications avec client: {applications_with_client}")
        print(f"   ⚠️  Applications sans client: {applications_without_client}")
        
        if applications_without_client > 0:
            print(f"\n   ⚠️  Attention: {applications_without_client} applications n'ont pas de client associé!")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n" + "=" * 60)
    print("✅ VÉRIFICATION TERMINÉE")
    print("=" * 60)

if __name__ == '__main__':
    check_database()