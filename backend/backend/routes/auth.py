import re
import uuid
import time
import bcrypt
import jwt as pyjwt

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

from backend.app import db
from backend.models.user import User

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def generate_token(user_id: str) -> str:
    """Genera un JWT firmado con la clave del servidor. Expira en 7 días."""
    payload = {
        'user_id': user_id,
        'exp': time.time() + 604800  # 7 días en segundos
    }
    return pyjwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validar que vengan todos los campos
        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({'error': 'Todos los campos son requeridos'}), 400

        # Validar formato de email
        if not is_valid_email(email):
            return jsonify({'error': 'El formato del email no es válido'}), 400

        # Validar longitud de contraseña
        if len(password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400

        # Validar longitud de username
        if len(username) < 3:
            return jsonify({'error': 'El nombre de usuario debe tener al menos 3 caracteres'}), 400

        # Verificar si el email ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 400

        # Verificar si el username ya existe
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400

        # Hashear contraseña con bcrypt
        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Crear usuario
        new_user = User(
            id=str(uuid.uuid4()),
            email=email,
            username=username,
            password_hash=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        # Generar token JWT
        token = generate_token(new_user.id)

        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'access_token': token,
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400

        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()

        # Usamos el mismo mensaje para email y contraseña incorrectos
        # para no revelar si el email existe o no (seguridad)
        if not user:
            return jsonify({'error': 'Credenciales inválidas'}), 401

        # Verificar contraseña
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Credenciales inválidas'}), 401

        # Verificar que la cuenta esté activa
        if not user.is_active:
            return jsonify({'error': 'Cuenta desactivada. Contacta soporte.'}), 403

        # Generar token JWT
        token = generate_token(user.id)

        return jsonify({
            'message': 'Login exitoso',
            'access_token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
def me():
    try:
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token no proporcionado'}), 401

        token = auth_header.split(' ')[1]

        payload = pyjwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )

        user = User.query.get(payload['user_id'])

        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado. Inicia sesión nuevamente.'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500