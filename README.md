# Parchate 🧠

**AI-powered mental wellness web app** — journal, AI chat with multiple personalities, and personalized emotional insights.

🌐 **Live demo:** [parchate-app-sepia.vercel.app](https://parchate-app-sepia.vercel.app)

---

## What it does

Parchate gives users a private space to reflect and find clarity through:

- **📓 Personal journal** — write entries, track your mood, and see stats over time
- **🤖 AI chat** — conversations powered by LLaMA 3.3-70B (via Groq) with 4 distinct personalities: Stoic Guide, High-Performance Coach, Philosopher, and Scientist
- **📊 Personal insights** — the AI analyzes your journal entries and chat history to generate a personalized emotional report: detected patterns, recommendations, and an inspirational quote from relevant thinkers (Marcus Aurelius, Viktor Frankl, Andrew Huberman, etc.)
- **🎨 Dynamic themes** — 5 fully custom visual themes (Minimalism, Discipline, Nature, Femininity, Spiritual) switchable at runtime via CSS variables
- **🔐 Auth** — JWT + bcrypt registration/login, token-based password reset via transactional email (Resend)

---

## Tech stack

### Backend
| Technology | Role |
|------------|------|
| Python + Flask | REST API, blueprints, route guards |
| SQLAlchemy + PostgreSQL | ORM, relational data model |
| PyJWT + bcrypt | Authentication & password hashing |
| Groq SDK (LLaMA 3.3-70B) | AI chat & insight generation |
| Resend | Transactional email (password reset) |
| Gunicorn | Production WSGI server |
| Render | Cloud deployment |

### Frontend
| Technology | Role |
|------------|------|
| React 19 + Vite | SPA framework |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Chart.js | Dashboard visualizations |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Vercel | Frontend deployment + SPA rewrites |

---

## Architecture

```
parchate/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # App factory, DB init, CORS, blueprints
│   │   ├── models/
│   │   │   ├── user.py        # User model
│   │   │   ├── journal.py     # JournalEntry model
│   │   │   └── ai_chat.py     # AIConversation + AIMessage models
│   │   └── routes/
│   │       ├── auth.py        # Register, login, /me, JWT guard
│   │       ├── journal.py     # CRUD entries + stats
│   │       ├── ai_chat.py     # Conversations + Groq AI chat
│   │       ├── analysis.py    # Insight engine (journal + chat → LLM)
│   │       ├── password_reset.py  # Forgot/reset via Resend email
│   │       └── prompts.py     # 4 AI personality system prompts
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Register, Dashboard, Journal, Chat, Profile, Onboarding
    │   ├── components/        # Button, Card, Input, ConfirmModal, PrivateRoute
    │   ├── context/           # AuthContext (JWT decode), ThemeContext (CSS vars)
    │   └── config/
    │       └── themes.js      # 5 theme definitions + applyTheme()
    └── package.json
```

---

## Key features in depth

### AI insight engine
The `/api/analysis/insights` endpoint reads the user's last 5 journal entries + last 20 chat messages, builds a context string, and sends it to LLaMA 3.3-70B with a structured JSON prompt. The model returns: `estado_general`, `patron_detectado`, `recomendacion`, `frase_inspiradora`, `autor_frase`. The result is validated and surfaced in the dashboard.

### Dynamic theming
Each theme defines ~20 CSS variables (backgrounds, accents, text, nav, borders, particles). `applyTheme()` sets them all on `:root` at runtime. All components read exclusively from CSS variables — switching themes is instantaneous with no page reload.

### JWT auth flow
- Registration: hash password with bcrypt → insert user → return signed JWT (7 days)
- Login: verify bcrypt → return JWT
- Protected routes: `Authorization: Bearer <token>` header → decode with PyJWT → extract `user_id`
- Password reset: generate short-lived reset token (1h) → email link via Resend → verify token purpose claim → update hash

---

## Running locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in: SECRET_KEY, JWT_SECRET_KEY, DATABASE_URL, GROQ_API_KEY, RESEND_API_KEY, FRONTEND_URL

python app.py
# API running at http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev
# App running at http://localhost:3000
```

### Environment variables

**Backend `.env`**
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/parchate
GROQ_API_KEY=your-groq-api-key
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=http://localhost:3000
```

---

## API reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Login → JWT | — |
| GET | `/api/auth/me` | Current user | ✓ |
| POST | `/api/auth/forgot-password` | Send reset email | — |
| POST | `/api/auth/reset-password` | Update password | — |
| GET | `/api/journal/entries` | List entries (paginated) | ✓ |
| POST | `/api/journal/entries` | Create entry | ✓ |
| PUT | `/api/journal/entries/:id` | Update entry | ✓ |
| DELETE | `/api/journal/entries/:id` | Delete entry | ✓ |
| GET | `/api/journal/stats` | Total entries, mood stats | ✓ |
| GET | `/api/ai/conversations` | List conversations | ✓ |
| POST | `/api/ai/conversations` | New conversation | ✓ |
| POST | `/api/ai/conversations/:id/chat` | Send message → AI reply | ✓ |
| DELETE | `/api/ai/conversations/:id` | Delete conversation | ✓ |
| GET | `/api/analysis/insights` | Generate AI insight report | ✓ |

---

## Screenshots

> _Add screenshots of Dashboard, Journal, and Chat pages here_

---

## Author

**Carlos Andrés Castro Sánchez** — Backend & Fullstack Developer  
[LinkedIn](#) · [Email](mailto:carlosacs2004@gmail.com)

---

## License

MIT
