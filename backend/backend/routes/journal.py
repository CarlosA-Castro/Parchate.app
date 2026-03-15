import uuid
import jwt as pyjwt

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from sqlalchemy import func

from ..app import db
from ..models.journal import JournalEntry

journal_bp = Blueprint('journal', __name__)


def get_user_id_from_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = pyjwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        return payload.get('user_id')
    except pyjwt.InvalidTokenError:
        return None


@journal_bp.route('/entries', methods=['GET'])
def get_entries():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        entries = (
            JournalEntry.query
            .filter_by(user_id=user_id)
            .order_by(JournalEntry.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return jsonify({
            'entries': [entry.to_dict() for entry in entries.items],
            'total': entries.total,
            'pages': entries.pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@journal_bp.route('/entries', methods=['POST'])
def create_entry():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        data = request.get_json()

        if not data or not data.get('content', '').strip():
            return jsonify({'error': 'El contenido es requerido'}), 400

        entry = JournalEntry(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content=data['content'].strip(),
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
def update_entry(entry_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        data = request.get_json()

        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

        if not entry:
            return jsonify({'error': 'Entrada no encontrada'}), 404

        if 'content' in data:
            entry.content = data['content'].strip()
        if 'mood' in data:
            entry.mood = data['mood']
        if 'tags' in data:
            entry.tags = data['tags']
        if 'title' in data:
            entry.title = data['title']

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
def delete_entry(entry_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
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
def get_stats():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        total_entries = JournalEntry.query.filter_by(user_id=user_id).count()

        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_entries = JournalEntry.query.filter(
            JournalEntry.user_id == user_id,
            JournalEntry.created_at >= week_ago
        ).count()

        common_mood = (
            db.session.query(JournalEntry.mood, func.count(JournalEntry.mood))
            .filter(JournalEntry.user_id == user_id, JournalEntry.mood.isnot(None))
            .group_by(JournalEntry.mood)
            .order_by(func.count(JournalEntry.mood).desc())
            .first()
        )

        return jsonify({
            'total_entries': total_entries,
            'entries_last_7_days': recent_entries,
            'most_common_mood': common_mood[0] if common_mood else None
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500