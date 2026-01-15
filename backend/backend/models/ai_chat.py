from datetime import datetime
from backend.app import db
import uuid

class AIConversation(db.Model):
    __tablename__ = 'ai_conversations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)  # SIN ForeignKey aquí
    title = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AIMessage(db.Model):
    __tablename__ = 'ai_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = db.Column(db.String(36), nullable=False)  # SIN ForeignKey aquí
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }
