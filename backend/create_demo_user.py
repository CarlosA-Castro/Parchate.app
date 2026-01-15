# create_demo_user.py
import sqlite3
import bcrypt
import uuid
from datetime import datetime

# Crear conexión a la base de datos
conn = sqlite3.connect('parchate.db')
cursor = conn.cursor()

# Activar foreign keys
cursor.execute('PRAGMA foreign_keys = ON')

# Crear tabla users si no existe
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

# Crear usuario demo
demo_email = 'demo@parchate.com'
demo_username = 'UsuarioDemo'
demo_password = 'password123'

# Generar hash de la contraseña
hashed_password = bcrypt.hashpw(demo_password.encode('utf-8'), bcrypt.gensalt())

# Insertar usuario demo
cursor.execute('''
    INSERT INTO users (id, email, username, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
''', (str(uuid.uuid4()), demo_email, demo_username, hashed_password.decode('utf-8'), datetime.utcnow().isoformat()))

print(f"✅ Usuario demo creado:")
print(f"   Email: {demo_email}")
print(f"   Usuario: {demo_username}")
print(f"   Contraseña: {demo_password}")

conn.commit()
conn.close()

print("✅ Base de datos lista para usar")
