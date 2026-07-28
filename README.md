# ☁️ SkyPulse Weather Dashboard

A modern, full-stack weather application built with **React.js** and **Django REST Framework**. SkyPulse provides real-time weather information, air quality monitoring, interactive maps, weather forecasts, geolocation support, AI-powered weather assistance, and city comparison through a clean glassmorphism-based user interface.

---

# 🚀 Features

## 🌦 Weather Information

- Real-time weather updates
- 7-Day weather forecast
- 24-Hour forecast
- Temperature & Feels Like
- Humidity & Atmospheric Pressure
- Wind Speed
- UV Index
- Visibility
- Sunrise & Sunset

---

## 📍 Location Services

- Search weather by city
- Current location weather
- GPS-based weather detection
- Reverse geocoding
- Interactive weather map
- Dynamic map markers

---

## 🌫 Air Quality Monitoring

- Live AQI Monitoring
- PM2.5
- PM10
- Ozone (O₃)
- Nitrogen Dioxide (NO₂)
- Sulphur Dioxide (SO₂)
- Carbon Monoxide (CO)
- AQI Category Indicators

---

## 🤖 AI Weather Assistant

Powered by **Google Gemini AI**

- Ask weather-related questions
- Personalized weather suggestions
- Smart clothing recommendations
- Outdoor activity suggestions
- Travel recommendations
- Context-aware AI responses using live weather data

---

## 📊 Analytics & Comparison

- Weather Trends
- Multi-city Weather Comparison
- Interactive Charts
- Historical Weather Insights

---

## 🎨 User Experience

- Glassmorphism UI
- Dark / Light Theme
- Responsive Design
- Smooth Framer Motion Animations
- Dynamic Weather Backgrounds
- Voice Search Support
- Recent Search History
- Mobile Friendly

---

# 🛠 Tech Stack

## Frontend

- React.js
- Redux Toolkit
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Leaflet
- React Icons

---

## Backend

- Python
- Django
- Django REST Framework
- SQLite
- Redis Cache

---

## APIs

- Open-Meteo Weather API
- Open-Meteo Geocoding API
- Open-Meteo Air Quality API
- OpenStreetMap Nominatim
- Google Gemini AI

---

# ⚡ Performance Optimizations

- Redis Caching
- Weather Response Caching
- Geocoding Cache
- AQI Cache
- Forecast Cache
- Debounced Search
- Optimized Redux State Management
- Lazy Loading Components
- API Error Handling
- Reduced Network Requests
- Faster AI Recommendations
- Optimized API Response Times

---

# 🏗 Architecture

```
React Frontend
       │
       ▼
Redux Toolkit
       │
       ▼
Django REST API
       │
       ├── Open-Meteo Weather API
       ├── Air Quality API
       ├── Geocoding API
       ├── OpenStreetMap
       └── Google Gemini AI
```

---

# 📂 Project Structure

```
SkyPulse/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── store/
│
├── backend/
│   ├── weather/
│   ├── ai/
│   ├── users/
│   ├── services/
│   └── settings.py
│
└── README.md
```

---

# 🔧 Installation

## Clone Repository

```bash
git clone https://github.com/senthur1606/SkyPulse.git
```

```bash
cd SkyPulse
```

---

## Backend

```bash
cd backend
```

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run server

```bash
python manage.py migrate
python manage.py runserver
```

---

## Frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Start development server

```bash
npm run dev
```

---

# 🌐 Environment Variables

Create a `.env` file inside the backend project.

```env
GEMINI_API_KEY=YOUR_API_KEY

WEATHER_API_BASE=https://api.open-meteo.com/v1
GEOCODING_API_BASE=https://geocoding-api.open-meteo.com/v1
AIR_QUALITY_API_BASE=https://air-quality-api.open-meteo.com/v1
```

---

# 📌 API Endpoints

## Weather

```
GET /api/weather/current/
GET /api/weather/forecast/
GET /api/weather/aqi/
GET /api/weather/search/
POST /api/weather/recommendations/
```

## AI

```
POST /api/ai/chat/
```

---

# 🎯 Learning Outcomes

This project demonstrates skills in:

- Full-Stack Web Development
- React.js
- Django REST Framework
- REST API Design
- Redux Toolkit
- State Management
- API Integration
- AI Integration
- Redis Caching
- Geolocation Services
- Interactive Maps
- Data Visualization
- Responsive UI Design
- Performance Optimization

---

# 🚀 Future Improvements

- User Authentication
- Weather Alerts
- Favorite Cities
- Weather Notifications
- PWA Support
- Docker Deployment
- PostgreSQL Support
- CI/CD Pipeline
- Unit & Integration Testing

---

# 👨‍💻 Author

**Senthur Pandian**

Aspiring Python Full-Stack Developer

📧 Email: sendhuponian1510@gmail.com

💼 GitHub: https://github.com/senthur1606

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.