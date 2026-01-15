# backend/models/user.py - AGREGAR ESTO
from datetime import datetime, timedelta
import jwt
from backend.app import db
import uuid
import os
from dotenv import load_dotenv

load_dotenv('../../.env')  # Cargar variables

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relaciones
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True)
    ai_conversations = db.relationship('AIConversation', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at.isoformat()
        }
    
    # NUEVO: Generar token JWT
    def generate_token(self, expires_in=86400):  # 24 horas por defecto
        payload = {
            'user_id': self.id,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        secret_key = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    # NUEVO: Verificar token estático
    @staticmethod
    def verify_token(token):
        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload['user_id']
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None