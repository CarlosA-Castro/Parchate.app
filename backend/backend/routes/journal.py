from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.journal import JournalEntry
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/entries', methods=['GET'])
@jwt_required()
def get_entries():
    try:
        user_id = get_jwt_identity()
        
        # Paginación
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        entries = JournalEntry.query.filter_by(user_id=user_id)\
            .order_by(JournalEntry.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'entries': [entry.to_dict() for entry in entries.items],
            'total': entries.total,
            'pages': entries.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries', methods=['POST'])
@jwt_required()
def create_entry():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'El contenido es requerido'}), 400
        
        entry = JournalEntry(
            user_id=user_id,
            content=data['content'],
            mood=data.get('mood'),
            tags=data.get('tags', [])
        )
        
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Entrada creada exitosamente',
            'entry': entry.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries/<entry_id>', methods=['PUT'])
@jwt_required()
def update_entry(entry_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        
        if not entry:
            return jsonify({'error': 'Entrada no encontrada'}), 404
        
        if 'content' in data:
            entry.content = data['content']
        if 'mood' in data:
            entry.mood = data['mood']
        if 'tags' in data:
            entry.tags = data['tags']
        
        entry.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Entrada actualizada',
            'entry': entry.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    try:
        user_id = get_jwt_identity()
        
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        
        if not entry:
            return jsonify({'error': 'Entrada no encontrada'}), 404
        
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({'message': 'Entrada eliminada'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = get_jwt_identity()
        
        # Estadísticas básicas
        total_entries = JournalEntry.query.filter_by(user_id=user_id).count()
        
        # Últimos 7 días
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_entries = JournalEntry.query.filter(
            JournalEntry.user_id == user_id,
            JournalEntry.created_at >= week_ago
        ).count()
        
        # Mood más común
        from sqlalchemy import func
        common_mood = db.session.query(
            JournalEntry.mood, func.count(JournalEntry.mood)
        ).filter(
            JournalEntry.user_id == user_id,
            JournalEntry.mood.isnot(None)
        ).group_by(JournalEntry.mood)\
         .order_by(func.count(JournalEntry.mood).desc())\
         .first()
        
        return jsonify({
            'total_entries': total_entries,
            'entries_last_7_days': recent_entries,
            'most_common_mood': common_mood[0] if common_mood else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
