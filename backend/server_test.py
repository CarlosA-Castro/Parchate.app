from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <h1>¡Parchate está vivo! 🚀</h1>
    <p>Servidor Flask funcionando correctamente</p>
    <ul>
        <li><a href="/api/health">Health Check</a></li>
        <li><a href="/api/test">Test API</a></li>
    </ul>
    '''

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'service': 'Parchate'})

@app.route('/api/test')
def test():
    return jsonify({'message': 'Todo funciona perfecto!'})

if __name__ == '__main__':
    print('🔥 Servidor iniciando...')
    print('🌐 Abre http://localhost:5000')
    print('🔧 Debug mode: ON')
    app.run(debug=True, port=5000)
