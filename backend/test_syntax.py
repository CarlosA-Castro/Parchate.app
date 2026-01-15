print("Probando sintaxis básica...")

try:
    exec(open('backend/app/__init__.py').read())
    print("✅ Sintaxis del archivo es correcta")
except SyntaxError as e:
    print(f"❌ Error de sintaxis: {e}")
    print(f"   Línea: {e.lineno}, Columna: {e.offset}")
    print(f"   Texto: {e.text}")
except Exception as e:
    print(f"❌ Otro error: {e}")

print("Fin de prueba")
