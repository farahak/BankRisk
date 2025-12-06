# backend/cleanup_database.py
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

def cleanup_database():
    """Nettoie la base de données et supprime les doublons"""
    
    print("=" * 60)
    print("🔧 NETTOYAGE DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    # 1. Supprimer la collection 'client' (doublon)
    print("\n1️⃣  Suppression de la collection 'client' (doublon)...")
    try:
        db = connect(db='bankrisk_db', host='mongodb://localhost:27017/bankrisk_db', alias='default')
        connection = db.get_database()
        if 'client' in connection.list_collection_names():
            connection.drop_collection('client')
            print("   ✅ Collection 'client' supprimée")
        else:
            print("   ℹ️  Collection 'client' n'existe pas")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 2. Vérifier les données existantes
    print("\n2️⃣  Vérification des données existantes...")
    try:
        clients_count = Client.objects.count()
        applications_count = CreditApplication.objects.count()
        users_count = CustomUser.objects.count()
        
        print(f"   📊 Clients: {clients_count}")
        print(f"   📊 Applications: {applications_count}")
        print(f"   📊 Utilisateurs: {users_count}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 3. Optionnel: Supprimer toutes les données pour repartir de zéro
    print("\n3️⃣  Voulez-vous supprimer TOUTES les données? (oui/non)")
    choice = input("   Votre choix: ").strip().lower()
    
    if choice == 'oui':
        print("\n   ⚠️  SUPPRESSION DE TOUTES LES DONNÉES...")
        try:
            Client.objects.all().delete()
            print("   ✅ Tous les clients supprimés")
            
            CreditApplication.objects.all().delete()
            print("   ✅ Toutes les applications supprimées")
            
            CustomUser.objects.all().delete()
            print("   ✅ Tous les utilisateurs supprimés")
            
            print("\n   ✅ Base de données nettoyée!")
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
    else:
        print("   ℹ️  Nettoyage annulé")
    
    # 4. Résumé final
    print("\n4️⃣  État final de la base de données...")
    try:
        clients_count = Client.objects.count()
        applications_count = CreditApplication.objects.count()
        users_count = CustomUser.objects.count()
        
        print(f"   📊 Clients: {clients_count}")
        print(f"   📊 Applications: {applications_count}")
        print(f"   📊 Utilisateurs: {users_count}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n" + "=" * 60)
    print("✅ NETTOYAGE TERMINÉ")
    print("=" * 60)

if __name__ == '__main__':
    cleanup_database()