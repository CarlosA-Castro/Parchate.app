import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    print("=== PARCHATE BACKEND ===")
    print("🌐 http://localhost:5000")
    print("📡 API: http://localhost:5000/api/*")
    print("=" * 30)

    with app.app_context():
        rules = sorted([r.rule for r in app.url_map.iter_rules()])
        print("\nRutas registradas:")
        for r in rules:
            print(f"  {r}")
        print()

    app.run(debug=True, port=5000, host='0.0.0.0')