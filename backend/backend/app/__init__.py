from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('../../../.env')

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///parchate.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 604800  # 7 días
    
    # Configurar CORS
    CORS(app, resources={r'/api/*': {'origins': 'http://localhost:3000'}})
    
    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    
    # CREAR TABLAS DE FORMA MANUAL - SIN PROBLEMAS DE FOREIGN KEYS
    def setup_database_safe():
        with app.app_context():
            print("Configurando base de datos...")
            
            # Conectar a SQLite directamente
            import sqlite3
            
            # Ruta a la base de datos
            db_url = app.config['SQLALCHEMY_DATABASE_URI']
            db_path = db_url.replace('sqlite:///', '')
            if db_path.startswith('/'):
                db_path = db_path[1:]
            
            # Si no existe, crear desde cero
            if not os.path.exists(db_path):
                print(f"Creando nueva base de datos en: {db_path}")
                
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                # Activar foreign keys para SQLite
                cursor.execute('PRAGMA foreign_keys = ON')
                
                # 1. Crear tabla users
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(36) PRIMARY KEY,
                        email VARCHAR(120) UNIQUE NOT NULL,
                        username VARCHAR(80) UNIQUE NOT NULL,
                        password_hash VARCHAR(256) NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                ''')
                print("✅ Tabla 'users' creada")
                
                # 2. Crear tabla journal_entries CON foreign key
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS journal_entries (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        content TEXT NOT NULL,
                        mood VARCHAR(20),
                        tags TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                ''')
                print("✅ Tabla 'journal_entries' creada")
                
                # 3. Crear tabla ai_conversations CON foreign key
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS ai_conversations (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        title VARCHAR(200),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                ''')
                print("✅ Tabla 'ai_conversations' creada")
                
                # 4. Crear tabla ai_messages CON foreign key
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS ai_messages (
                        id VARCHAR(36) PRIMARY KEY,
                        conversation_id VARCHAR(36) NOT NULL,
                        role VARCHAR(20) NOT NULL,
                        content TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id)
                    )
                ''')
                print("✅ Tabla 'ai_messages' creada")
                
                conn.commit()
                conn.close()
                print("✅ Base de datos creada exitosamente")
            else:
                print("✅ Base de datos ya existe")
    
    # Ejecutar setup seguro
    setup_database_safe()
    
    # IMPORTAR RUTAS BÁSICAS
    # Rutas principales
    from flask import Blueprint, jsonify
    
    main_bp = Blueprint('main', __name__)
    
    @main_bp.route('/')
    def home():
        return '''
        <html>
        <body style="font-family: Arial; padding: 40px;">
            <h1>🚀 Parchate API</h1>
            <p>Servidor backend funcionando</p>
            <ul>
                <li><a href="/api/health">Health Check</a></li>
                <li><a href="/api/test">Test API</a></li>
            </ul>
        </body>
        </html>
        '''
    
    @main_bp.route('/api/health')
    def health():
        return jsonify({'status': 'healthy', 'service': 'Parchate API'})
    
    @main_bp.route('/api/test')
    def test():
        return jsonify({'message': 'API funcionando'})
    
    # Blueprint de autenticación
    auth_bp = Blueprint('auth', __name__)
    
    @auth_bp.route('/register', methods=['POST'])
    def register():
        from flask import request
        import bcrypt
        import uuid
        from datetime import datetime
        
        try:
            data = request.get_json()
            
            if not data or not data.get('email') or not data.get('password') or not data.get('username'):
                return jsonify({'error': 'Todos los campos son requeridos'}), 400
            
            # Validar email
            import re
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', data['email']):
                return jsonify({'error': 'Email inválido'}), 400
            
            if len(data['password']) < 6:
                return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
            
            # Conectar a la base de datos
            import sqlite3
            db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            if db_path.startswith('/'):
                db_path = db_path[1:]
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Verificar si usuario existe
            cursor.execute('SELECT id FROM users WHERE email = ?', (data['email'],))
            if cursor.fetchone():
                conn.close()
                return jsonify({'error': 'El email ya está registrado'}), 400
            
            cursor.execute('SELECT id FROM users WHERE username = ?', (data['username'],))
            if cursor.fetchone():
                conn.close()
                return jsonify({'error': 'El nombre de usuario ya existe'}), 400
            
            # Crear usuario
            user_id = str(uuid.uuid4())
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            
            cursor.execute('''
                INSERT INTO users (id, email, username, password_hash, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, data['email'], data['username'], hashed_password.decode('utf-8'), datetime.utcnow().isoformat()))
            
            conn.commit()
            conn.close()
            
            # Generar token JWT simple (simulado por ahora)
            import jwt as pyjwt
            import time
            
            token = pyjwt.encode({
                'user_id': user_id,
                'exp': time.time() + 604800  # 7 días
            }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Usuario registrado exitosamente',
                'access_token': token,
                'user': {
                    'id': user_id,
                    'email': data['email'],
                    'username': data['username'],
                    'created_at': datetime.utcnow().isoformat()
                }
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @auth_bp.route('/login', methods=['POST'])
    def login():
        from flask import request
        import bcrypt
        import jwt as pyjwt
        import time
        import sqlite3
        
        try:
            data = request.get_json()
            
            if not data or not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email y contraseña requeridos'}), 400
            
            # Buscar usuario
            db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            if db_path.startswith('/'):
                db_path = db_path[1:]
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT id, email, username, password_hash FROM users WHERE email = ?', (data['email'],))
            user_data = cursor.fetchone()
            conn.close()
            
            if not user_data:
                return jsonify({'error': 'Credenciales inválidas'}), 401
            
            user_id, email, username, password_hash = user_data
            
            # Verificar contraseña
            if not bcrypt.checkpw(data['password'].encode('utf-8'), password_hash.encode('utf-8')):
                return jsonify({'error': 'Credenciales inválidas'}), 401
            
            # Generar token
            token = pyjwt.encode({
                'user_id': user_id,
                'exp': time.time() + 604800
            }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Login exitoso',
                'access_token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'username': username
                }
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Registrar blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    return app
