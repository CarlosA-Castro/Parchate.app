# VERSIÓN COMPLETA CON JWT
from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import re
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validaciones
        if not data or not data.get('email') or not data.get('password') or not data.get('username'):
            return jsonify({'error': 'Todos los campos son requeridos'}), 400
        
        if not is_valid_email(data['email']):
            return jsonify({'error': 'Email inválido'}), 400
        
        if len(data['password']) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        # Verificar si usuario existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'El nombre de usuario ya existe'}), 400
        
        # Crear usuario
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        user = User(
            email=data['email'],
            username=data['username'],
            password_hash=hashed_password.decode('utf-8')
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generar token JWT
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña requeridos'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Generar token JWT
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Login exitoso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_token():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'valid': False, 'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'valid': True, 'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500