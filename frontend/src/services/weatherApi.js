import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skypulse-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('skypulse-refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('skypulse-token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('skypulse-token');
          localStorage.removeItem('skypulse-refresh');
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===== Mock data for demo (when backend not available) =====
// const mockCurrentWeather = (city) => ({
//   city: city || 'New York',
//   country: 'US',
//   temperature: Math.round(18 + Math.random() * 10),
//   feels_like: Math.round(16 + Math.random() * 10),
//   humidity: Math.round(55 + Math.random() * 30),
//   pressure: Math.round(1010 + Math.random() * 20),
//   wind_speed: Math.round(10 + Math.random() * 20),
//   wind_direction: 225,
//   wind_deg: 225,
//   visibility: Math.round(8 + Math.random() * 5),
//   uv_index: Math.round(3 + Math.random() * 6),
//   condition: 'Clear',
//   description: 'clear sky',
//   icon: '01d',
//   sunrise: '06:24',
//   sunset: '20:15',
//   lat: 40.7128,
//   lon: -74.0060,
//   timezone: 'America/New_York',
//   local_time: new Date().toISOString(),
//   cloud_cover: 15,
//   dew_point: 12,
// });

// const mockForecast = () => {
//   const conditions = ['Clear', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Sunny'];
//   const days = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date();
//     d.setDate(d.getDate() + i);
//     days.push({
//       date: d.toISOString().split('T')[0],
//       day: d.toLocaleDateString('en-US', { weekday: 'short' }),
//       high: Math.round(20 + Math.random() * 12),
//       low: Math.round(10 + Math.random() * 8),
//       condition: conditions[Math.floor(Math.random() * conditions.length)],
//       icon: ['01d','02d','10d','03d','01d'][Math.floor(Math.random() * 5)],
//       humidity: Math.round(50 + Math.random() * 30),
//       wind_speed: Math.round(8 + Math.random() * 20),
//       precipitation: Math.round(Math.random() * 100),
//     });
//   }
//   const hourly = [];
//   for (let h = 0; h < 24; h++) {
//     hourly.push({
//       hour: `${h.toString().padStart(2,'0')}:00`,
//       temperature: Math.round(15 + Math.random() * 12),
//       condition: conditions[Math.floor(Math.random() * conditions.length)],
//       icon: h >= 6 && h <= 20 ? '01d' : '01n',
//       precipitation: Math.round(Math.random() * 100),
//       wind_speed: Math.round(8 + Math.random() * 15),
//     });
//   }
//   return { daily: days, hourly };
// };

// const mockAQI = () => ({
//   aqi: Math.round(20 + Math.random() * 80),
//   category: 'Good',
//   pm2_5: parseFloat((5 + Math.random() * 20).toFixed(1)),
//   pm10: parseFloat((10 + Math.random() * 40).toFixed(1)),
//   o3: parseFloat((30 + Math.random() * 50).toFixed(1)),
//   no2: parseFloat((10 + Math.random() * 30).toFixed(1)),
//   so2: parseFloat((5 + Math.random() * 15).toFixed(1)),
//   co: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
// });

// ===== API Methods =====
const weatherApi = {
  // Weather endpoints
  getCurrentWeather: async (city) => {
    try {
      return await api.get(`/weather/current/?city=${encodeURIComponent(city)}`);
    } catch (error) {
  console.error(error);
  throw error;
}
  },
  getCurrentWeatherByCoords: async (lat, lon) => {
    try {
      return await api.get(`/weather/current/?lat=${lat}&lon=${lon}`);
    } catch (error) {
  console.error(error);
  throw error;
}
  },
  getForecast: async (city) => {
    try {
      return await api.get(`/weather/forecast/?city=${encodeURIComponent(city)}`);
    } catch (error) {
  console.error(error);
  throw error;
}
  },
  getForecastByCoords: async (lat, lon) => {
    try {
      return await api.get(`/weather/forecast/?lat=${lat}&lon=${lon}`);
    } catch (error) {
  console.error(error);
  throw error;
}
  },
  getAQI: async (city) => {
    try {
      return await api.get(`/weather/aqi/?city=${encodeURIComponent(city)}`);
    } catch (error) {
  console.error(error);
  throw error;
}
  },
  getAQIByCoords: async (lat, lon) => {
    try {
      return await api.get(`/weather/aqi/?lat=${lat}&lon=${lon}`);
    }catch (error) {
  console.error(error);
  throw error;
}
  },
  searchCities: async (query) => {
    try {
      return await api.get(`/weather/search/?q=${encodeURIComponent(query)}`);
    } catch {
      const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Berlin', 'Singapore'];
      const filtered = cities.filter(c => c.toLowerCase().includes(query.toLowerCase()));
      return { data: filtered.map(name => ({ name, country: 'US', state: '' })) };
    }
  },
  getHistorical: async (city, days = 7) => {
    try {
      return await api.get(`/weather/historical/?city=${encodeURIComponent(city)}&days=${days}`);
    } catch {
      const data = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({
          date: d.toISOString().split('T')[0],
          avg_temp: Math.round(15 + Math.random() * 10),
          max_temp: Math.round(20 + Math.random() * 10),
          min_temp: Math.round(10 + Math.random() * 8),
          humidity: Math.round(50 + Math.random() * 30),
          wind_speed: Math.round(8 + Math.random() * 20),
        });
      }
      return { data };
    }
  },

  // Favorites
  getFavorites: () => api.get('/weather/favorites/'),
  addFavorite: (city) => api.post('/weather/favorites/', { city }),
  removeFavorite: (city) => api.delete(`/weather/favorites/${encodeURIComponent(city)}/`),

  // Auth
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  getProfile: () => api.get('/auth/profile/'),

  // AI Recommendations
  getRecommendations: async (weatherData) => {
    try {
      return await api.post('/weather/recommendations/', weatherData);
    } catch {
      const temp = weatherData?.temperature || 20;
      const condition = weatherData?.condition?.toLowerCase() || 'clear';
      const recs = [];
      if (condition.includes('rain') || condition.includes('drizzle')) recs.push('☂️ Carry an umbrella — rain expected');
      if (temp < 10) recs.push('🧥 Wear a heavy coat — it\'s cold outside');
      else if (temp < 18) recs.push('🧤 Light jacket recommended');
      else if (temp > 30) recs.push('😎 Stay hydrated and wear sunscreen');
      if (weatherData?.uv_index > 6) recs.push('🕶️ High UV — wear sunglasses and SPF');
      if (weatherData?.wind_speed > 30) recs.push('💨 Strong winds — avoid outdoor activities');
      if (recs.length === 0) recs.push('✨ Great weather for outdoor activities!');
      return { data: { recommendations: recs } };
    }
  },

  // Export
  exportReport: (city) => api.get(`/weather/export/?city=${encodeURIComponent(city)}`, { responseType: 'blob' }),
};

export default weatherApi;
