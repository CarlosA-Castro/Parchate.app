print("=== PRUEBA DE BASE DE DATOS SIMPLIFICADA ===")

try:
    from backend.app import create_app
    print("✅ create_app importado")
    
    app = create_app()
    print("✅ Aplicación creada")
    
    # Probar con cliente de prueba
    with app.test_client() as client:
        response = client.get('/api/health')
        print(f"✅ Health check: {response.status_code}")
        print(f"📊 Response: {response.get_json()}")
        
        # Probar registro
        import json
        test_data = {
            'email': 'test@test.com',
            'password': 'test123',
            'username': 'testuser'
        }
        
        response = client.post('/api/auth/register', 
                              data=json.dumps(test_data),
                              content_type='application/json')
        print(f"✅ Registro: {response.status_code}")
        
        if response.status_code == 201:
            print("🎉 ¡Registro exitoso! Backend FUNCIONANDO")
        else:
            print(f"⚠️  Registro: {response.get_json()}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
