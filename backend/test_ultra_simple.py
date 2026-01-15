print("=== PRUEBA ULTRA SIMPLE ===")

try:
    from backend.app import create_app
    print("✅ 1. create_app importado")
    
    app = create_app()
    print("✅ 2. Aplicación Flask creada")
    
    # Probar endpoint básico
    with app.test_client() as client:
        response = client.get('/api/health')
        print(f"✅ 3. Health check: {response.status_code}")
        
        if response.status_code == 200:
            print(f"📊 Response: {response.get_json()}")
            print("🎉 ¡BACKEND FUNCIONANDO!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
