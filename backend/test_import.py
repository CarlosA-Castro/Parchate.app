print("Probando importación completa...")

try:
    from backend.app import create_app
    print("✅ create_app importado correctamente")
    
    app = create_app()
    print("✅ Aplicación Flask creada")
    
    # Probar una ruta básica
    with app.test_client() as client:
        response = client.get('/')
        print(f"✅ Home route: {response.status_code}")
        
        response = client.get('/api/health')
        print(f"✅ Health check: {response.status_code}")
    
    print("🎉 ¡Todo funciona!")
    
except ImportError as e:
    print(f"❌ Error de importación: {e}")
    print("Probable problema de rutas Python")
    
except Exception as e:
    print(f"❌ Error inesperado: {e}")
    import traceback
    traceback.print_exc()
