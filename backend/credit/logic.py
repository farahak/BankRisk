# backend/credit/logic.py

def calculate_risk_analysis(client_data, application_data):
    """
    Calcule le score de risque et le taux d'intérêt basé sur le German Credit Dataset.
    Score: 0-100 (0 = Excellent, 100 = Risque Critique)
    """
    score = 30  # Base score
    factors = []

    # 1. Âge
    age = client_data.get('age', 30)
    if age < 25:
        score += 15
        factors.append({'label': 'Âge jeune (< 25 ans)', 'impact': +15, 'type': 'negative'})
    elif age > 60:
        score += 5
        factors.append({'label': 'Âge senior (> 60 ans)', 'impact': +5, 'type': 'negative'})
    else:
        score -= 5
        factors.append({'label': 'Tranche d\'âge stable', 'impact': -5, 'type': 'positive'})

    # 2. Emploi (Job level: 0-3)
    job = client_data.get('job', 2)
    if job <= 1:
        score += 10
        factors.append({'label': 'Emploi non qualifié ou instable', 'impact': +10, 'type': 'negative'})
    elif job == 3:
        score -= 10
        factors.append({'label': 'Hautement qualifié / Cadre', 'impact': -10, 'type': 'positive'})

    # 3. Logement
    housing = client_data.get('housing', 'rent')
    if housing == 'own':
        score -= 10
        factors.append({'label': 'Propriétaire de son logement', 'impact': -10, 'type': 'positive'})
    elif housing == 'rent':
        score += 5
        factors.append({'label': 'Locataire', 'impact': +5, 'type': 'negative'})

    # 4. Épargne (saving_accounts: little, moderate, quite rich, rich)
    savings = client_data.get('saving_accounts', 'NA')
    if savings in ['little', 'NA']:
        score += 10
        factors.append({'label': 'Épargne faible ou non renseignée', 'impact': +10, 'type': 'negative'})
    elif savings == 'rich':
        score -= 15
        factors.append({'label': 'Épargne solide', 'impact': -15, 'type': 'positive'})

    # 5. Montant vs Durée (Pression financière)
    amount = application_data.get('credit_amount', 0)
    duration = application_data.get('duration', 12)
    monthly_ratio = amount / duration if duration > 0 else 0
    
    if monthly_ratio > 1000:
        score += 10
        factors.append({'label': 'Mensualité élevée (> 1000€)', 'impact': +10, 'type': 'negative'})

    # Bornage du score
    score = max(0, min(100, score))
    
    # Détermination de la catégorie de risque
    risk_label = 'good'
    if score > 60:
        risk_label = 'bad'
    elif score > 40:
        risk_label = 'pending'  # On demande une revue manuelle approfondie

    # Calcul du taux d'intérêt
    interest_base = 4.5
    malus_risk = (score / 100) * 3.0  # Jusqu'à +3% pour le risque
    malus_duration = 0.5 if duration > 24 else 0
    
    total_interest = interest_base + malus_risk + malus_duration

    return {
        'score': round(score, 1),
        'risk': risk_label,
        'interest_rate': round(total_interest, 2),
        'factors': factors
    }
