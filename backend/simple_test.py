from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '¡Parchate está vivo! 🚀 <br><a href="/api/test">Test API</a>'

@app.route('/api/test')
def test():
    return {'status': 'ok', 'message': 'Backend funcionando'}

if __name__ == '__main__':
    print('🔥 Servidor iniciando en http://localhost:5000')
    app.run(debug=True, port=5000)
