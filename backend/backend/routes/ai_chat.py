import os
import uuid
import jwt as pyjwt

from flask import Blueprint, request, jsonify, current_app
from groq import Groq

from ..app import db
from ..models.ai_chat import AIConversation, AIMessage
from ..routes.prompts import get_prompt

ai_chat_bp = Blueprint('ai_chat', __name__)

client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))


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


@ai_chat_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        conversations = (
            AIConversation.query
            .filter_by(user_id=user_id)
            .order_by(AIConversation.created_at.desc())
            .all()
        )

        result = []
        for conv in conversations:
            message_count = AIMessage.query.filter_by(conversation_id=conv.id).count()
            result.append({
                'id': conv.id,
                'title': conv.title or f'Conversación {conv.created_at.strftime("%d/%m")}',
                'created_at': conv.created_at.isoformat(),
                'message_count': message_count
            })

        return jsonify({'conversations': result}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_chat_bp.route('/conversations', methods=['POST'])
def create_conversation():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        conversation = AIConversation(
            id=str(uuid.uuid4()),
            user_id=user_id
        )
        db.session.add(conversation)
        db.session.commit()

        return jsonify({
            'message': 'Conversación creada',
            'conversation': {
                'id': conversation.id,
                'created_at': conversation.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ai_chat_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        conversation = AIConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()

        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404

        messages = (
            AIMessage.query
            .filter_by(conversation_id=conversation_id)
            .order_by(AIMessage.created_at.asc())
            .all()
        )

        return jsonify({'messages': [m.to_dict() for m in messages]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_chat_bp.route('/conversations/<conversation_id>/chat', methods=['POST'])
def chat(conversation_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        data = request.get_json()
        if not data or not data.get('message', '').strip():
            return jsonify({'error': 'El mensaje no puede estar vacío'}), 400

        user_message_text = data['message'].strip()
        personality = data.get('personality', 'default')

        conversation = AIConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()

        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404

        user_msg = AIMessage(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role='user',
            content=user_message_text
        )
        db.session.add(user_msg)

        history = (
            AIMessage.query
            .filter_by(conversation_id=conversation_id)
            .order_by(AIMessage.created_at.asc())
            .limit(10)
            .all()
        )

        system_prompt = get_prompt(personality)

        messages_for_api = [{'role': 'system', 'content': system_prompt}]
        for msg in history:
            messages_for_api.append({'role': msg.role, 'content': msg.content})
        messages_for_api.append({'role': 'user', 'content': user_message_text})

        ai_response_text = _call_groq(messages_for_api)

        ai_msg = AIMessage(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role='assistant',
            content=ai_response_text
        )
        db.session.add(ai_msg)

        if not conversation.title:
            conversation.title = (
                user_message_text[:50] + '...'
                if len(user_message_text) > 50
                else user_message_text
            )

        db.session.commit()

        return jsonify({
            'message': ai_response_text,
            'message_id': ai_msg.id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ai_chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    try:
        conversation = AIConversation.query.filter_by(
            id=conversation_id,
            user_id=user_id
        ).first()

        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404

        AIMessage.query.filter_by(conversation_id=conversation_id).delete()
        db.session.delete(conversation)
        db.session.commit()

        return jsonify({'message': 'Conversación eliminada'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def _call_groq(messages: list) -> str:
    if not os.getenv('GROQ_API_KEY'):
        return "No tengo conexión a la IA en este momento. Puedes escribir en tu diario mientras tanto — poner los pensamientos en papel ya ayuda a clarificarlos."

    try:
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Tuve un problema técnico ({str(e)[:60]}). Intenta de nuevo en un momento."