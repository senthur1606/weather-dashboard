import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import { getWeatherIcon, getTempColor } from '../../utils/weatherUtils';
import weatherApi from '../../services/weatherApi';
import SearchBar from '../../components/SearchBar';
import {FiTrash2, FiArrowRight, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FavoriteWeatherCard = ({ city, onRemove, onClick }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weatherApi.getCurrentWeather(city).then(r => {
      setWeather(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="shimmer w-24 h-5 rounded mb-3" />
      <div className="shimmer w-16 h-10 rounded mb-2" />
      <div className="shimmer w-20 h-4 rounded" />
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 cursor-pointer relative group"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(city); }}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500/20 transition-all"
      >
        <FiTrash2 size={12} />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <FiMapPin className="text-sky-400" size={12} />
            <span className="text-white/60 text-xs font-body">{weather?.country || '—'}</span>
          </div>
          <h3 className="font-display font-bold text-white text-lg leading-none">{city}</h3>
        </div>
        <span className="text-3xl">{getWeatherIcon(weather?.condition)}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div
            className="font-display font-extrabold text-4xl leading-none"
            style={{ color: getTempColor(weather?.temperature) }}
          >
            {weather?.temperature ?? '—'}°
          </div>
          <div className="text-white/50 text-xs mt-1 font-body capitalize">{weather?.description}</div>
        </div>
        <FiArrowRight className="text-white/30 group-hover:text-sky-400 transition-colors" size={18} />
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 text-xs text-white/40 font-mono">
        <span>💧 {weather?.humidity}%</span>
        <span>💨 {weather?.wind_speed} km/h</span>
      </div>
    </motion.div>
  );
};

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.favorites);

  const handleRemove = (city) => {
    dispatch(toggleFavorite(city));
    toast(`Removed ${city}`, { icon: '💔' });
  };

  const handleCityClick = (city) => {
    navigate('/', { state: { city } });
    dispatch({ type: 'weather/fetchWeather', payload: city });
  };

  const handleAddCity = (city) => {
    if (!items.includes(city)) {
      dispatch(toggleFavorite(city));
      toast.success(`Added ${city} to favorites`, { icon: '❤️' });
    } else {
      toast(`${city} is already in favorites`, { icon: 'ℹ️' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Favorite Cities
          </h1>
          <p className="text-white/50 font-body">
            {items.length} {items.length === 1 ? 'city' : 'cities'} saved
          </p>
        </motion.div>

        {/* Add city */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar
            onSelect={handleAddCity}
            placeholder="Add a city to favorites..."
            className="max-w-md"
          />
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="text-7xl mb-6">💔</div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">No favorites yet</h2>
            <p className="text-white/50 font-body max-w-sm mx-auto">
              Search for cities and click the heart icon to save them here for quick access.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {items.map((city) => (
                <FavoriteWeatherCard
                  key={city}
                  city={city}
                  onRemove={handleRemove}
                  onClick={() => handleCityClick(city)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
