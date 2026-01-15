from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Parchate API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .status { color: green; font-weight: bold; }
            .endpoint { background: #f8f9fa; padding: 10px; border-left: 4px solid #007bff; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Parchate API está funcionando</h1>
            <p class="status">✅ Servidor activo y listo</p>
            
            <h2>Endpoints disponibles:</h2>
            <div class="endpoint">
                <strong>GET /api/health</strong> - Estado del servidor
            </div>
            <div class="endpoint">
                <strong>GET /api/test</strong> - Prueba de conexión
            </div>
            <div class="endpoint">
                <strong>POST /api/auth/register</strong> - Registro de usuario
            </div>
            <div class="endpoint">
                <strong>POST /api/auth/login</strong> - Login de usuario
            </div>
            
            <h2>Próximos pasos:</h2>
            <p>1. Frontend se conectará a esta API</p>
            <p>2. Base de datos SQLite configurada</p>
            <p>3. Prueba en: <a href="/api/health">/api/health</a></p>
        </div>
    </body>
    </html>
    '''

@main_bp.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Parchate API',
        'version': '1.0.0',
        'database': 'connected'
    })

@main_bp.route('/api/test')
def test():
    return jsonify({
        'message': '¡Backend de Parchate funcionando correctamente!',
        'timestamp': '2024-01-15T10:00:00Z',
        'endpoints': [
            '/api/health',
            '/api/auth/register',
            '/api/auth/login',
            '/api/journal/entries',
            '/api/ai/chat'
        ]
    })
