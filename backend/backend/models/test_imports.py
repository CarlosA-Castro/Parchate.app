print("🚀 Probando importaciones...")

try:
    from app import create_app
    print("✅ create_app importado correctamente")
    
    app = create_app()
    print("✅ Aplicación Flask creada")
    
    with app.app_context():
        from backend.models.user import User
        from backend.models.journal import JournalEntry
        from backend.models.ai_chat import AIConversation
        
        print("✅ Todos los modelos importados correctamente")
        
        # Verificar que las rutas están registradas
        routes = [rule.rule for rule in app.url_map.iter_rules()]
        print(f"✅ {len(routes)} rutas registradas")
        
        # Filtrar rutas de API
        api_routes = [r for r in routes if r.startswith('/api')]
        print(f"📡 Rutas API: {len(api_routes)}")
        
        for route in sorted(api_routes)[:5]:  # Mostrar primeras 5
            print(f"   - {route}")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
