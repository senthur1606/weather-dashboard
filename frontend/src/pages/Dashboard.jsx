import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeather, fetchWeatherByCoords } from '../store/slices/weatherSlice';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import weatherApi from '../services/weatherApi';
import AQIWidget from '../components/AQIWidget';
import Charts from '../components/Charts';
import AIRecommendations from '../components/AIRecommendations';
import WeatherMap from '../components/WeatherMap';
import { useGeolocation, useInterval } from '../hooks';
import { formatLastUpdated } from '../utils/weatherUtils';
import { FiHeart, FiRefreshCw, FiNavigation, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';


const Dashboard = () => {
  const dispatch = useDispatch();
  const { current, forecast, aqi, loading, error, lastUpdated } = useSelector(s => s.weather);
  const { items: favorites } = useSelector(s => s.favorites);
  const { location, loading: geoLoading, getLocation } = useGeolocation();

  useEffect(() => {getLocation();}, [getLocation]);

  const handleMapClick = (lat, lon) => {
  dispatch(fetchWeatherByCoords({lat, lon}));
};

  // Auto-refresh every 10 minutes
  useInterval(() => {
    if (current?.city) dispatch(fetchWeather(current.city));
  }, 600000);

  // Load by geolocation when available
useEffect(() => {
  if (location) {
    dispatch(fetchWeatherByCoords(location));
  }
}, [location, dispatch]);

  useEffect(() => {
  if (current) {
    localStorage.setItem(
      "weatherContext",
      JSON.stringify(current)
    );
   }
  }, [current]);

  const handleRefresh = () => {
  if (current?.city && !loading) {
    dispatch(fetchWeather(current.city));
    toast.success("Weather updated");
  }
};

  const handleCitySelect = useCallback((city) => {
    dispatch(fetchWeather(city));
    localStorage.setItem('skypulse-last-city', city);
    toast.success(`Loading weather for ${city}`, { icon: '🌍' });
  }, [dispatch]);

  const handleFavoriteToggle = () => {
    if (!current?.city) return;
    dispatch(toggleFavorite(current.city));
    const isFav = favorites.includes(current.city);
    toast(isFav ? `Removed ${current.city} from favorites` : `Added ${current.city} to favorites`, {
      icon: isFav ? '💔' : '❤️',
    });
  };

const handleExport = async () => {
  try {

    toast.loading('Generating report...', {
      id: 'export'
    });

    const cityName =
      current?.city || 'Current Location';

    const response =
      await weatherApi.exportReport(cityName);

    const blob = new Blob(
      [response.data],
      { type: 'application/pdf' }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `weather_${cityName}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success(
      'Report downloaded!',
      { id: 'export' }
    );

  } catch (error) {

    console.error(error);

    toast.error(
      'Export failed',
      { id: 'export' }
    );
  }
};

const isFavorite = favorites.includes(current?.city);
if (geoLoading && !current) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      <p>Getting your location...</p>
    </div>
  );
}

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Search + Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <div className="flex-1">
            <SearchBar onSelect={handleCitySelect} />
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getLocation}
              disabled={geoLoading}
              title="Use my location"
              className=" w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-sky-400 hover:text-sky-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all disabled:opacity-50"
            >
              <FiNavigation
  className={geoLoading ? "animate-spin" : ""}
/>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavoriteToggle}
              disabled={!current}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-sky-400 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]${
                isFavorite ? 'text-red-400' : 'text-white/50 hover:text-red-400'
              }`}
            >
              <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleRefresh}
  disabled={loading || !current}
  title="Refresh"
  className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-sky-400 transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
>
  <FiRefreshCw
    size={15}
    className={loading ? "animate-spin" : ""}
  />
</motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              title="Export report"
              className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-sky-400 hover:text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all"
            >
              <FiDownload size={15} />
            </motion.button>
          </div>
        </motion.div>

        {/* Last updated */}
        {lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-4 text-white/30 text-xs font-mono"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Last updated {formatLastUpdated(lastUpdated)}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6"
          >
            <FiAlertTriangle size={18} />
            <span className="text-sm font-body">{error}</span>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left column - main weather */}
          <div className="xl:col-span-2 space-y-4">
            <WeatherCard data={current} loading={loading || geoLoading } />
            <WeatherMap
              lat={current?.lat}
              lon={current?.lon}
              city={current?.city}
              onMapClick={handleMapClick}
             />
            <ForecastCard data={forecast} loading={loading || geoLoading} />
            <Charts forecast={forecast} />
          </div>

          {/* Right column - widgets */}
          <div className="space-y-4">
            <AQIWidget data={aqi} loading={loading || geoLoading} />
            <AIRecommendations weatherData={current} />
            <FavoritesCityList onSelect={handleCitySelect} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoritesCityList = ({ onSelect }) => {
  const { items } = useSelector(s => s.favorites);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-3xl p-6"
    >
      <h2 className="font-display font-semibold text-white text-lg mb-4">Quick Access</h2>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 8).map((city) => (
          <motion.button
            key={city}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(city)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/30 text-white/70 hover:text-white transition-all text-sm font-body"
          >
            <FiHeart size={11} className="text-red-400" fill="currentColor" />
            {city}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
