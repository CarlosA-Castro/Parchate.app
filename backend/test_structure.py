# test_simple.py - Prueba MUY simple
import sys
import os

print("🧪 Probando estructura...")
print(f"📁 Directorio actual: {os.getcwd()}")
print(f"📁 Contenido: {os.listdir('.')}")

# Intentar diferentes estructuras
try:
    # Opción 1: Estructura con backend/backend/
    sys.path.insert(0, '.')
    sys.path.insert(0, 'backend')
    
    print("\n1. Intentando importar desde 'backend.app'...")
    from backend.app import create_app
    print("✅ ¡Éxito! Estructura: backend/backend/")
    
except ImportError as e1:
    print(f"❌ Error 1: {e1}")
    
    try:
        # Opción 2: Estructura plana
        print("\n2. Intentando importar desde 'app'...")
        sys.path.insert(0, '.')
        from app import create_app
        print("✅ ¡Éxito! Estructura plana")
        
    except ImportError as e2:
        print(f"❌ Error 2: {e2}")
        
        try:
            # Opción 3: Buscar en subdirectorios
            print("\n3. Buscando archivos Python...")
            for root, dirs, files in os.walk('.'):
                for file in files:
                    if file.endswith('.py'):
                        print(f"   📄 {os.path.join(root, file)}")
                        
        except Exception as e3:
            print(f"❌ Error 3: {e3}")
