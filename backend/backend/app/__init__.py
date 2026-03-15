from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-cambiar-en-produccion')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-cambiar-en-produccion')

    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(basedir, "parchate.db")}'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, resources={
        r'/api/*': {
            'origins': [
                'http://localhost:5173',
                'http://localhost:3000',
            ],
            'supports_credentials': True
        }
    })

    db.init_app(app)

    with app.app_context():
        from ..models.user import User
        from ..models.journal import JournalEntry
        from ..models.ai_chat import AIConversation, AIMessage

        db.create_all()
        print("✅ Base de datos lista")

    from ..routes.main import main_bp
    app.register_blueprint(main_bp)

    from ..routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from ..routes.journal import journal_bp
    app.register_blueprint(journal_bp, url_prefix='/api/journal')

    from ..routes.ai_chat import ai_chat_bp
    app.register_blueprint(ai_chat_bp, url_prefix='/api/ai')
    
    from ..routes.password_reset import password_reset_bp
    app.register_blueprint(password_reset_bp, url_prefix='/api/auth')

    return app