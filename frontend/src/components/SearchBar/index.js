import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { searchCities, clearSearch } from '../../store/slices/weatherSlice';
import { useDebounce, useVoiceSearch } from '../../hooks';
import { FiSearch, FiX, FiMapPin, FiMic } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SearchBar = ({ onSelect, placeholder = 'Search for a city...', className = '' }) => {
  const dispatch = useDispatch();
  const { searchResults, searchLoading } = useSelector(s => s.weather);
  const [recentSearches, setRecentSearches] = useState([])
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);

  const handleVoiceResult = (text) => {
    setQuery(text);
    toast.success(`🎤 Searching: "${text}"`);
  };
  const { listening, supported: voiceSupported, startListening, stopListening } = useVoiceSearch(handleVoiceResult);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(searchCities(debouncedQuery.trim()));
    } else {
      dispatch(clearSearch());
    }
  }, [debouncedQuery, dispatch]);

  useEffect(()=>{
    const searches= JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(searches);
  },[]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (city) => {
    const cityName = city.name || city;
    saveRecentSearch(cityName);
    onSelect(cityName);
    setQuery('');
    setFocused(false);
    dispatch(clearSearch());
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearch());
    inputRef.current?.focus();
  };

  const saveRecentSearch = (city)=>{
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");

    recent = recent.filter(
      item => item.toLowerCase() !== city.toLowerCase()
    );

    recent.unshift(city);

    recent = recent.slice(0, 5);

    localStorage.setItem("recentSearches",
      JSON.stringify(recent)
    );

    setRecentSearches(recent);
  }

  const showDropdown = focused && (searchResults.length > 0 || searchLoading) && query.length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 2px rgba(56, 189, 248, 0.4), 0 8px 30px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.2)',
        }}
        className="relative flex items-center glass-card rounded-2xl overflow-hidden"
      >
        <div className="pl-4 pr-2">
          {searchLoading ? (
            <div className="w-4 h-4 spinner" />
          ) : (
            <FiSearch className={`transition-colors ${focused ? 'text-sky-400' : 'text-white/40'}`} size={18} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) handleSelect({ name: query.trim() });
            if (e.key === 'Escape') { setFocused(false); setQuery(''); }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3.5 px-2 text-white placeholder-white/40 search-input font-body text-sm"
        />

        <div className="flex items-center gap-1 pr-3">
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleClear}
                className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
              >
                <FiX size={12} />
              </motion.button>
            )}
          </AnimatePresence>

          {voiceSupported && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={listening ? stopListening : startListening}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                listening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
              }`}
            >
              <FiMic size={13} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
          >
            {searchLoading ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-4 h-4 spinner" />
                <span className="text-white/50 text-sm">Searching...</span>
              </div>
            ) : (
              searchResults.map((city, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleSelect(city)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all text-left border-b border-white/5 last:border-0"
                >
                  <FiMapPin className="text-sky-400 flex-shrink-0" size={14} />
                  <div>
                    <div className="text-white text-sm font-medium">{city.name}</div>
                    {(city.state || city.country) && (
                      <div className="text-white/40 text-xs">{[city.state, city.country].filter(Boolean).join(', ')}</div>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {recentSearches.length > 0 && !query && (
      <div className="mt-2 glass-card rounded-xl px-3 py-2">
          <div className="flex items-center justify-between mb-2">
           <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider"> Recent Searches </span>

      <button
        onClick={() => {
          localStorage.removeItem("recentSearches");
          setRecentSearches([]);
        }}
        className="text-xs text-red-400 hover:text-red-300"
      >
        Clear
      </button>
    </div>

    <div className="flex flex-wrap gap-2">
      {recentSearches.map((city) => (
        <button
          key={city}
          onClick={() => handleSelect(city)}
          className="
            px-3 py-1
            rounded-full
            bg-white/5
            border border-white/10
            hover:border-sky-500/40
            hover:bg-sky-500/10
            text-xs
            text-white/70
            hover:text-white
            transition-all
          "
        >
          <span>{city}</span>
        </button>
      ))}
      </div>
    </div> 
  )}
    </div>
  );
};

export default SearchBar;
