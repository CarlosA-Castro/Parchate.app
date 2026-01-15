# test_final.py
print("🧪 Probando importación corregida...")

try:
    from backend.app import create_app
    print("✅ create_app importado exitosamente")
    
    app = create_app()
    print("✅ Aplicación Flask creada")
    
    print("🎉 ¡Todo funciona correctamente!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
