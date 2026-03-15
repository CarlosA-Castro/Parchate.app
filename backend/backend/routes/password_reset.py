import os
import uuid
import jwt as pyjwt
import resend

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta

from ..app import db
from ..models.user import User
import bcrypt

password_reset_bp = Blueprint('password_reset', __name__)

resend.api_key = os.getenv('RESEND_API_KEY', '')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')


def generate_reset_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'purpose': 'password_reset',
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return pyjwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )


def verify_reset_token(token: str):
    try:
        payload = pyjwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        if payload.get('purpose') != 'password_reset':
            return None
        return payload.get('user_id')
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None


# ─────────────────────────────────────────────
# POST /api/auth/forgot-password
# Body: { email }
# Envía el email con el link de recuperación
# ─────────────────────────────────────────────

@password_reset_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'error': 'El email es requerido'}), 400

        user = User.query.filter_by(email=email).first()

        # Siempre respondemos igual para no revelar si el email existe
        if not user:
            return jsonify({
                'message': 'Si ese email está registrado, recibirás un enlace en breve.'
            }), 200

        token = generate_reset_token(user.id)
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

        resend.Emails.send({
            'from': 'Parchate <onboarding@resend.dev>',
            'to': [email],
            'subject': 'Recupera tu contraseña — Parchate',
            'html': f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">

              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; width: 56px; height: 56px; background: #000; border-radius: 16px; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span style="color: white; font-size: 24px; font-weight: bold;">π</span>
                </div>
                <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">Parchate</h1>
              </div>

              <h2 style="font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px;">
                Recupera tu contraseña
              </h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
                Hola {user.username}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
                Si no fuiste tú, puedes ignorar este email.
              </p>

              <a href="{reset_link}"
                style="display: block; background: #000; color: #fff; text-align: center;
                       padding: 14px 24px; border-radius: 12px; text-decoration: none;
                       font-size: 15px; font-weight: 600; margin-bottom: 24px;">
                Restablecer contraseña
              </a>

              <p style="color: #888; font-size: 13px; line-height: 1.6;">
                Este enlace expira en <strong>1 hora</strong>. Si el botón no funciona,
                copia y pega este enlace en tu navegador:
              </p>
              <p style="color: #888; font-size: 12px; word-break: break-all;">
                {reset_link}
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
              <p style="color: #aaa; font-size: 12px; text-align: center;">
                Parchate · Tu espacio de claridad mental
              </p>
            </div>
            """
        })

        return jsonify({
            'message': 'Si ese email está registrado, recibirás un enlace en breve.'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error al enviar el email: {str(e)}'}), 500


# ─────────────────────────────────────────────
# POST /api/auth/reset-password
# Body: { token, password }
# Verifica el token y actualiza la contraseña
# ─────────────────────────────────────────────

@password_reset_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token', '').strip()
        new_password = data.get('password', '')

        if not token or not new_password:
            return jsonify({'error': 'Token y contraseña son requeridos'}), 400

        if len(new_password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400

        user_id = verify_reset_token(token)
        if not user_id:
            return jsonify({'error': 'El enlace es inválido o ha expirado'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        hashed = bcrypt.hashpw(
            new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        user.password_hash = hashed
        db.session.commit()

        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar la contraseña: {str(e)}'}), 500