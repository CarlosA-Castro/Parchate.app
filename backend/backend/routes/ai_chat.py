from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.ai_chat import AIConversation, AIMessage
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai
import os
from datetime import datetime

ai_chat_bp = Blueprint('ai_chat', __name__)

# Configurar OpenAI (usaremos una versión gratuita inicialmente)
openai.api_key = os.getenv('OPENAI_API_KEY', '')

SYSTEM_PROMPT = \"\"\"Eres Parchate, un asistente emocional inteligente y compasivo.
Tu objetivo es ayudar a los usuarios a procesar sus emociones, no dar consejos médicos.

Directrices:
1. Sé empático y validante
2. Haz preguntas reflexivas
3. Ayuda a identificar patrones
4. Sugiere técnicas de mindfulness cuando sea apropiado
5. Recuerda que no eres un terapeuta profesional
6. En situaciones de crisis, sugiere contactar profesionales

Estilo: Calmo, amigable, pero profesional.\"\"\"

@ai_chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        user_id = get_jwt_identity()
        
        conversations = AIConversation.query.filter_by(user_id=user_id)\
            .order_by(AIConversation.created_at.desc())\
            .all()
        
        return jsonify({
            'conversations': [{
                'id': conv.id,
                'title': conv.title or f\"Conversación {conv.created_at.strftime('%d/%m')}\",
                'created_at': conv.created_at.isoformat(),
                'message_count': len(conv.messages)
            } for conv in conversations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    try:
        user_id = get_jwt_identity()
        
        conversation = AIConversation(user_id=user_id)
        
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
@jwt_required()
def get_messages(conversation_id):
    try:
        user_id = get_jwt_identity()
        
        conversation = AIConversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        
        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404
        
        messages = AIMessage.query.filter_by(conversation_id=conversation_id)\
            .order_by(AIMessage.created_at.asc())\
            .all()
        
        return jsonify({
            'messages': [msg.to_dict() for msg in messages]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_chat_bp.route('/conversations/<conversation_id>/chat', methods=['POST'])
@jwt_required()
def chat(conversation_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('message'):
            return jsonify({'error': 'El mensaje es requerido'}), 400
        
        # Verificar conversación
        conversation = AIConversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        
        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404
        
        # Guardar mensaje del usuario
        user_message = AIMessage(
            conversation_id=conversation_id,
            role='user',
            content=data['message']
        )
        db.session.add(user_message)
        
        # Obtener historial para contexto
        previous_messages = AIMessage.query.filter_by(conversation_id=conversation_id)\
            .order_by(AIMessage.created_at.desc())\
            .limit(10)\
            .all()
        
        # Preparar mensajes para OpenAI
        messages = [{\"role\": \"system\", \"content\": SYSTEM_PROMPT}]
        
        # Agregar historial (más recientes primero, luego invertir)
        for msg in reversed(previous_messages):
            messages.append({\"role\": msg.role, \"content\": msg.content})
        
        # Agregar nuevo mensaje del usuario
        messages.append({\"role\": \"user\", \"content\": data['message']})
        
        # Llamar a OpenAI (o alternativa gratuita)
        try:
            if openai.api_key:
                response = openai.ChatCompletion.create(
                    model=\"gpt-3.5-turbo\",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )
                ai_response = response.choices[0].message.content
            else:
                # Respuesta de fallback si no hay API key
                ai_response = \"Entiendo que estás pasando por un momento difícil. ¿Quieres hablar más sobre lo que sientes? Recuerda que estoy aquí para escucharte y ayudarte a procesar tus emociones.\"
        
        except Exception as ai_error:
            print(f\"Error en IA: {ai_error}\")
            ai_response = \"Estoy teniendo dificultades técnicas. Mientras tanto, ¿qué tal si escribes cómo te sientes en tu diario? La escritura puede ser muy terapéutica.\"
        
        # Guardar respuesta de IA
        ai_message = AIMessage(
            conversation_id=conversation_id,
            role='assistant',
            content=ai_response
        )
        db.session.add(ai_message)
        
        # Actualizar título si es la primera respuesta
        if len(conversation.messages) == 2:  # Usuario + IA
            # Crear título basado en el primer mensaje
            title = data['message'][:50] + \"...\" if len(data['message']) > 50 else data['message']
            conversation.title = title
        
        db.session.commit()
        
        return jsonify({
            'message': ai_response,
            'message_id': ai_message.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ai_chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    try:
        user_id = get_jwt_identity()
        
        conversation = AIConversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        
        if not conversation:
            return jsonify({'error': 'Conversación no encontrada'}), 404
        
        db.session.delete(conversation)
        db.session.commit()
        
        return jsonify({'message': 'Conversación eliminada'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
