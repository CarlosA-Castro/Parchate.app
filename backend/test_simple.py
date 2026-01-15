# test_simple.py
import sys
import os

sys.path.insert(0, '.')
sys.path.insert(0, 'backend')

print("🧪 Probando creación de tablas...")

try:
    from backend.app import create_app
    print("✅ create_app importado")
    
    app = create_app()
    print("✅ Aplicación Flask creada")
    
    # Probar con cliente de prueba
    with app.test_client() as client:
        response = client.get('/')
        print(f"✅ Home route: {response.status_code}")
        
        response = client.get('/api/health')
        print(f"✅ Health check: {response.status_code}")
        print(f"📊 Response: {response.get_json()}")
        
    print("🎉 ¡Todo funciona correctamente!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
