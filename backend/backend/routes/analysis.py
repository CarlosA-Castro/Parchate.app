import os
import jwt as pyjwt

from flask import Blueprint, request, jsonify, current_app
from groq import Groq

from ..app import db
from ..models.journal import JournalEntry
from ..models.ai_chat import AIConversation, AIMessage

analysis_bp = Blueprint('analysis', __name__)

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


# ─────────────────────────────────────────────
# GET /api/analysis/insights
# Lee las últimas entradas del diario y chats
# del usuario y genera recomendaciones con IA
# ─────────────────────────────────────────────

@analysis_bp.route('/insights', methods=['GET'])
def get_insights():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401

    if not os.getenv('GROQ_API_KEY'):
        return jsonify({'error': 'IA no disponible'}), 503

    try:
        # Últimas 5 entradas del diario
        entries = (
            JournalEntry.query
            .filter_by(user_id=user_id)
            .order_by(JournalEntry.created_at.desc())
            .limit(5)
            .all()
        )

        # Últimos 20 mensajes de todas las conversaciones
        conversations = (
            AIConversation.query
            .filter_by(user_id=user_id)
            .order_by(AIConversation.created_at.desc())
            .limit(3)
            .all()
        )

        chat_messages = []
        for conv in conversations:
            messages = (
                AIMessage.query
                .filter_by(conversation_id=conv.id, role='user')
                .order_by(AIMessage.created_at.desc())
                .limit(7)
                .all()
            )
            chat_messages.extend(messages)

        # Si no hay suficiente data, no generar análisis
        if not entries and not chat_messages:
            return jsonify({
                'insights': None,
                'message': 'Escribe algunas entradas en tu diario para recibir tu análisis personalizado.'
            }), 200

        # Construir contexto para la IA
        journal_context = ''
        if entries:
            journal_context = 'ENTRADAS DEL DIARIO (más recientes primero):\n'
            for entry in entries:
                journal_context += f'- Mood: {entry.mood or "no especificado"} | {entry.content[:200]}\n'

        chat_context = ''
        if chat_messages:
            chat_context = '\nMENSAJES DEL USUARIO EN CHATS:\n'
            for msg in chat_messages:
                chat_context += f'- {msg.content[:150]}\n'

        prompt = f"""Eres Parchate, un asistente de claridad mental. Analiza el siguiente contenido del usuario y genera un análisis breve y personalizado.

{journal_context}
{chat_context}

Genera una respuesta en formato JSON con exactamente esta estructura:
{{
  "estado_general": "Una frase corta (máx 8 palabras) describiendo el estado emocional general",
  "patron_detectado": "Una observación concreta sobre un patrón que ves en sus escritos (2-3 oraciones)",
  "recomendacion": "Una recomendación práctica y personalizada basada en lo que escribió (2-3 oraciones)",
  "frase_inspiradora": "Una frase corta de un filósofo, científico o líder que sea relevante para su situación actual",
  "autor_frase": "Nombre del autor de la frase"
}}

Responde SOLO con el JSON, sin texto adicional, sin bloques de código.
Sé específico y personal — menciona elementos concretos de lo que escribió el usuario.
No seas genérico. Usa la sabiduría de Marco Aurelio, Frankl, Huberman, Goggins o quien sea más relevante."""

        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.6,
            max_tokens=400
        )

        raw = response.choices[0].message.content.strip()

        # Limpiar posibles bloques de código que el modelo añada
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip()

        import json
        insights = json.loads(raw)

        return jsonify({'insights': insights}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500