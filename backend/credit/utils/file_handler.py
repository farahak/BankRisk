# backend/credit/utils/file_handler.py
import os
import uuid
import hashlib
from django.conf import settings
from django.core.exceptions import ValidationError
from werkzeug.utils import secure_filename

# Constantes
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = ['application/pdf']
ALLOWED_EXTENSIONS = ['.pdf']


def validate_pdf_file(file):
    """
    Valide qu'un fichier est bien un PDF valide
    
    Args:
        file: Fichier uploadé (UploadedFile object)
    
    Raises:
        ValidationError: Si le fichier n'est pas valide
    
    Returns:
        bool: True si valide
    """
    # Vérifier l'extension
    filename = file.name.lower()
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValidationError("Seuls les fichiers PDF sont autorisés (.pdf)")
    
    # Vérifier le MIME type
    content_type = getattr(file, 'content_type', '')
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(f"Type de fichier invalide. Attendu: {', '.join(ALLOWED_MIME_TYPES)}")
    
    # Vérifier la taille (5MB max)
    if file.size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        raise ValidationError(f"Fichier trop volumineux (max {max_mb}MB)")
    
    # Vérifier le contenu (magic bytes PDF: %PDF)
    file.seek(0)
    header = file.read(4)
    file.seek(0)  # Reset position
    
    if header != b'%PDF':
        raise ValidationError("Fichier PDF corrompu ou invalide (magic bytes manquants)")
    
    return True


def generate_safe_filename(original_name, user_email):
    """
    Génère un nom de fichier sécurisé et unique
    
    Args:
        original_name: Nom original du fichier
        user_email: Email de l'utilisateur qui upload
    
    Returns:
        str: Nom de fichier sécurisé
    """
    # Nettoyer le nom original
    safe_name = secure_filename(original_name)
    
    # Ajouter un UUID pour l'unicité
    unique_id = str(uuid.uuid4())[:8]
    
    # Hash de l'email pour anonymisation partielle
    user_hash = hashlib.md5(user_email.encode()).hexdigest()[:8]
    
    # Format: {user_hash}_{uuid}_{original_name}
    return f"{user_hash}_{unique_id}_{safe_name}"


def save_attachment(file, user_email, message):
    """
    Sauvegarde une pièce jointe de manière sécurisée
    
    Args:
        file: Fichier uploadé
        user_email: Email de l'utilisateur
        message: Instance du message lié
    
    Returns:
        Attachment: Instance de l'attachment créé
    
    Raises:
        ValidationError: Si le fichier n'est pas valide
    """
    from ..models.message import Attachment
    
    # Valider le fichier
    validate_pdf_file(file)
    
    # Générer un nom de fichier sécurisé
    safe_filename = generate_safe_filename(file.name, user_email)
    
    # Créer le répertoire si nécessaire
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'attachments')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Chemin complet du fichier
    file_path = os.path.join(upload_dir, safe_filename)
    
    # Sauvegarder le fichier
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    # Créer l'objet Attachment
    attachment = Attachment(
        filename=file.name,  # Nom original pour l'affichage
        file_path=file_path,
        file_size=file.size,
        mime_type=file.content_type or 'application/pdf',
        uploaded_by=user_email,
        message=message
    )
    attachment.save()
    
    return attachment


def delete_attachment_file(file_path):
    """
    Supprime un fichier du système de fichiers
    
    Args:
        file_path: Chemin du fichier à supprimer
    
    Returns:
        bool: True si supprimé, False sinon
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Erreur lors de la suppression du fichier {file_path}: {e}")
    return False


def get_file_size_display(size_bytes):
    """
    Convertit une taille en bytes en format lisible
    
    Args:
        size_bytes: Taille en bytes
    
    Returns:
        str: Taille formatée (ex: "2.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} PB"
