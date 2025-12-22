# Test script pour l'API de messagerie
# Usage: python test_messaging_api.py

import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Se connecter en tant qu'admin
print("🔐 Connexion en tant qu'admin...")
login_response = requests.post(
    f"{BASE_URL}/auth/login/",
    json={
        "email": "admin@bankrisk.com",
        "password": "admin123"  # Remplacez par votre mot de passe
    }
)

if login_response.status_code == 200:
    token = login_response.json()['access']
    print(f"✅ Connecté! Token: {token[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 2. Récupérer une application
    print("\n📋 Récupération des applications...")
    apps_response = requests.get(f"{BASE_URL}/applications/", headers=headers)
    
    if apps_response.status_code == 200:
        apps = apps_response.json()
        if apps:
            app_id = apps[0]['id']
            print(f"✅ Application trouvée: {app_id}")
            
            # 3. Envoyer un message de test
            print(f"\n💬 Envoi d'un message de test...")
            message_data = {
                "application_id": app_id,
                "subject": "Test de messagerie",
                "content": "Ceci est un message de test depuis le script Python"
            }
            
            message_response = requests.post(
                f"{BASE_URL}/messages/",
                data=message_data,
                headers=headers
            )
            
            print(f"Status: {message_response.status_code}")
            print(f"Response: {json.dumps(message_response.json(), indent=2)}")
            
            if message_response.status_code == 201:
                print("✅ Message envoyé avec succès!")
                
                # 4. Récupérer la conversation
                print(f"\n📖 Récupération de la conversation...")
                conv_response = requests.get(
                    f"{BASE_URL}/messages/conversation/{app_id}/",
                    headers=headers
                )
                
                if conv_response.status_code == 200:
                    messages = conv_response.json()
                    print(f"✅ {len(messages)} message(s) trouvé(s)")
                    for msg in messages:
                        print(f"  - {msg['sender_type']}: {msg['content'][:50]}...")
                else:
                    print(f"❌ Erreur: {conv_response.json()}")
            else:
                print(f"❌ Erreur lors de l'envoi: {message_response.json()}")
        else:
            print("❌ Aucune application trouvée")
    else:
        print(f"❌ Erreur: {apps_response.json()}")
else:
    print(f"❌ Erreur de connexion: {login_response.json()}")
