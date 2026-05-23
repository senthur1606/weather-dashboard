# ☁️ SkyPulse — Premium Weather Dashboard

A full-stack weather dashboard with a glassmorphism UI, real-time data, forecasts, AQI tracking, AI recommendations, and more.

![SkyPulse Preview](https://via.placeholder.com/1200x600/0c4a6e/38bdf8?text=SkyPulse+Weather+Dashboard)

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion, Redux Toolkit, Recharts, React Router |
| **Backend** | Django 4.2, Django REST Framework, SimpleJWT, Django CORS Headers |
| **Database** | PostgreSQL (production) / SQLite (development) |
| **Cache** | Redis + django-redis |
| **Tasks** | Celery + Celery Beat |
| **API** | OpenWeatherMap API |
| **Auth** | JWT (access + refresh tokens) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Redis (optional — app gracefully degrades without it)
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

---

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/skypulse-weather.git
cd skypulse-weather
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your WEATHER_API_KEY

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/api/docs/**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env if needed (defaults to localhost:8000)

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

### 4. Start Celery (optional — for background tasks)

```bash
cd backend
source venv/bin/activate

# Start worker
celery -A weather_project worker -l info

# Start beat scheduler (in another terminal)
celery -A weather_project beat -l info
```

## 🗺️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register/` | — | Register new user |
| `POST` | `/api/auth/login/` | — | Login & get JWT tokens |
| `POST` | `/api/auth/token/refresh/` | — | Refresh access token |
| `GET` | `/api/auth/profile/` | ✅ | Get/update user profile |
| `GET` | `/api/weather/current/?city=London` | — | Current weather |
| `GET` | `/api/weather/current/?lat=51.5&lon=-0.12` | — | Weather by coordinates |
| `GET` | `/api/weather/forecast/?city=London` | — | 7-day + hourly forecast |
| `GET` | `/api/weather/aqi/?city=London` | — | Air quality index |
| `GET` | `/api/weather/search/?q=Lon` | — | City autocomplete |
| `GET` | `/api/weather/historical/?city=London&days=7` | — | Historical data |
| `GET` | `/api/weather/alerts/?city=London` | — | Active weather alerts |
| `GET` | `/api/weather/favorites/` | ✅ | List favorite cities |
| `POST` | `/api/weather/favorites/` | ✅ | Add favorite city |
| `DELETE` | `/api/weather/favorites/{city}/` | ✅ | Remove favorite |
| `POST` | `/api/weather/recommendations/` | — | AI recommendations |
| `GET` | `/api/weather/export/?city=London` | — | Export PDF report |
| `GET` | `/api/health/` | — | Health check |

## 📁 Project Structure

```
skypulse-weather/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar/
│   │   │   ├── SearchBar/     # Debounced + voice search
│   │   │   ├── WeatherCard/   # Main weather display
│   │   │   ├── ForecastCard/  # 7-day + 24h forecast
│   │   │   ├── Charts/        # Recharts analytics
│   │   │   ├── AQIWidget/     # Air quality display
│   │   │   ├── AIRecommendations/
│   │   │   ├── SkeletonLoader/
│   │   │   └── WeatherBackground/  # Animated weather particles
│   │   ├── pages/
│   │   │   ├── Dashboard/     # Main weather page
│   │   │   ├── Favorites/     # Saved cities
│   │   │   └── Compare/       # Side-by-side city comparison
│   │   ├── store/             # Redux Toolkit state
│   │   │   └── slices/        # weather, favorites, auth
│   │   ├── hooks/             # useWeather, useDebounce, useGeolocation, useVoiceSearch
│   │   ├── context/           # ThemeContext (dark/light + weather bg)
│   │   ├── services/          # Axios API client with JWT + mock fallback
│   │   ├── utils/             # weatherUtils (formatting, colors, icons)
│   │   └── styles/            # Tailwind + glassmorphism CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/                   # Django application
│   ├── weather_project/       # Django project config
│   │   ├── settings.py        # All configuration
│   │   ├── urls.py            # Root URL routing
│   │   ├── celery.py          # Celery config
│   │   └── middleware.py      # Request logging
│   ├── weather_api/           # Main Django app
│   │   ├── models.py          # FavoriteCity, WeatherAlert, UserProfile, WeatherSnapshot
│   │   ├── views.py           # All DRF API views
│   │   ├── serializers.py     # Request/response serializers
│   │   ├── services.py        # OpenWeatherMap integration + business logic
│   │   ├── tasks.py           # Celery background tasks
│   │   ├── utils.py           # Helpers, PDF export, error handlers
│   │   ├── urls.py            # App URL routing
│   │   ├── admin.py           # Django admin customisation
│   │   ├── signals.py         # Auto user profile creation
│   │   
│   ├── requirements.txt
```

---

## 🎨 Key Features

- **Glassmorphism UI** — blur, transparency, glowing borders
- **Animated weather backgrounds** — particles, rain, snow effects that match conditions
- **Dark / Light mode** — persisted to localStorage, respects system preference
- **Debounced city search** with autocomplete and voice input
- **Geolocation** — one-click weather for your current location
- **7-day + 24h forecast** with interactive charts (temperature, rain, wind, humidity)
- **AQI widget** — PM2.5, PM10, O3, NO2, SO2, CO with color-coded indicators
- **AI Recommendations** — rule-based clothing, UV, and activity advice
- **City Comparison** — compare up to 3 cities with radar chart
- **Favorites** — persistent local + server-side favorites management
- **PDF Export** — download weather reports
- **JWT Auth** — register, login, refresh tokens
- **PWA** — installable, offline-capable
- **Celery** — cache warming + email alerts in background
- **Swagger docs** at `/api/docs/`

---


### Backend → Render
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn weather_project.wsgi:application --bind 0.0.0.0:$PORT`
6. Add environment variables from `.env.example`

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
