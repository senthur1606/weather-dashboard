import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeather, fetchWeatherByCoords } from '../store/slices/weatherSlice';

// ===== useWeather =====
export const useWeather = () => {
  const dispatch = useDispatch();
  const { current, forecast, aqi, loading, error, lastUpdated } = useSelector(s => s.weather);

  const loadWeather = useCallback((city) => {
    dispatch(fetchWeather(city));
  }, [dispatch]);

  const loadWeatherByCoords = useCallback((lat, lon) => {
    dispatch(fetchWeatherByCoords({ lat, lon }));
  }, [dispatch]);

  const refresh = useCallback(() => {
    if (current?.city) loadWeather(current.city);
  }, [current, loadWeather]);

  return { current, forecast, aqi, loading, error, lastUpdated, loadWeather, loadWeatherByCoords, refresh };
};

// ===== useDebounce =====
export const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// ===== useGeolocation =====
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, error, loading, getLocation };
};

// ===== useLocalStorage =====
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setStoredValue = useCallback((val) => {
    try {
      const toStore = val instanceof Function ? val(value) : val;
      setValue(toStore);
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch {}
  }, [key, value]);

  return [value, setStoredValue];
};

// ===== useInterval =====
export const useInterval = (callback, delay) => {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

// ===== useWindowSize =====
export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
};

// ===== useVoiceSearch =====
export const useVoiceSearch = (onResult) => {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    recognitionRef.current.start();
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, startListening, stopListening };
};
