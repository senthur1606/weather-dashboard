// ===== Temperature Conversions =====
export const celsiusToFahrenheit = (c) => Math.round((c * 9) / 5 + 32);
export const fahrenheitToCelsius = (f) => Math.round(((f - 32) * 5) / 9);

// ===== Wind Direction =====
export const degToCompass = (deg) => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

// ===== UV Index =====
export const getUVCategory = (uv) => {
  if (uv <= 2) return { label: 'Low', color: '#22c55e' };
  if (uv <= 5) return { label: 'Moderate', color: '#eab308' };
  if (uv <= 7) return { label: 'High', color: '#f97316' };
  if (uv <= 10) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#a855f7' };
};

// ===== AQI =====
export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' };
  return { label: 'Hazardous', color: '#991b1b', bg: 'rgba(153,27,27,0.15)' };
};

// ===== Weather Icon Map =====
export const getWeatherIcon = (condition, isNight = false) => {
  const c = condition?.toLowerCase() || '';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('drizzle') || c.includes('light rain')) return '🌦️';
  if (c.includes('rain') || c.includes('shower')) return '🌧️';
  if (c.includes('snow') || c.includes('blizzard')) return '❄️';
  if (c.includes('sleet') || c.includes('ice')) return '🌨️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
  if (c.includes('wind') || c.includes('gale')) return '💨';
  if (c.includes('tornado') || c.includes('cyclone')) return '🌪️';
  if (c.includes('cloud') || c.includes('overcast')) return isNight ? '☁️' : '⛅';
  if (c.includes('partly')) return isNight ? '🌙' : '⛅';
  if (c.includes('clear') || c.includes('sunny') || c.includes('fair')) return isNight ? '🌙' : '☀️';
  return isNight ? '🌙' : '🌤️';
};

// ===== Format Date/Time =====
export const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

export const getRelativeDay = (dateStr) => {
  const today = new Date();
  const d = new Date(dateStr);
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

// ===== Temperature Color =====
export const getTempColor = (temp) => {
  if (temp <= 0) return '#93c5fd';
  if (temp <= 10) return '#60a5fa';
  if (temp <= 20) return '#34d399';
  if (temp <= 28) return '#fbbf24';
  if (temp <= 35) return '#f97316';
  return '#ef4444';
};

// ===== Precipitation Probability =====
export const getPrecipColor = (prob) => {
  if (prob < 20) return '#22c55e';
  if (prob < 50) return '#eab308';
  if (prob < 80) return '#f97316';
  return '#3b82f6';
};

// ===== Clothing Suggestions =====
export const getClothingSuggestion = (temp, condition) => {
  const c = condition?.toLowerCase() || '';
  if (temp <= 0) return '🧥 Heavy winter coat, gloves, scarf, and boots';
  if (temp <= 10) return '🧤 Warm jacket, scarf recommended';
  if (temp <= 18) return '🧣 Light jacket or cardigan';
  if (temp <= 24) return '👕 T-shirt with light layer';
  if (c.includes('rain')) return '☂️ Waterproof jacket or raincoat';
  if (temp <= 30) return '👗 Light summer clothes';
  return '🌞 Shorts and breathable fabric — stay cool!';
};

// ===== Last Updated Format =====
export const formatLastUpdated = (iso) => {
  if (!iso) return 'Never';
  const diff = Math.round((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
};

// ===== Visibility =====
export const getVisibilityLabel = (km) => {
  if (km >= 10) return 'Excellent';
  if (km >= 5) return 'Good';
  if (km >= 2) return 'Moderate';
  if (km >= 0.5) return 'Poor';
  return 'Very Poor';
};
