import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import weatherApi from '../../services/weatherApi';

export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (city, { rejectWithValue }) => {
    try {
      const [current, forecast, aqi] = await Promise.all([
        weatherApi.getCurrentWeather(city),
        weatherApi.getForecast(city),
        weatherApi.getAQI(city),
      ]);
      return { current: current.data, forecast: forecast.data, aqi: aqi.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch weather data');
    }
  }
);

export const fetchWeatherByCoords = createAsyncThunk(
  'weather/fetchWeatherByCoords',
  async ({ lat, lon }, { rejectWithValue }) => {
    try {
      const [current, forecast, aqi] = await Promise.all([
        weatherApi.getCurrentWeatherByCoords(lat, lon),
        weatherApi.getForecastByCoords(lat, lon),
        weatherApi.getAQIByCoords(lat, lon),
      ]);
      return { current: current.data, forecast: forecast.data, aqi: aqi.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch weather data');
    }
  }
);

export const searchCities = createAsyncThunk(
  'weather/searchCities',
  async (query, { rejectWithValue }) => {
    try {
      const response = await weatherApi.searchCities(query);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Search failed');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    current: null,
    forecast: null,
    aqi: null,
    searchResults: [],
    compareList: [],
    loading: false,
    searchLoading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSearch: (state) => { state.searchResults = []; },
    addToCompare: (state, action) => {
      if (state.compareList.length < 3 && !state.compareList.find(c => c.city === action.payload.city)) {
        state.compareList.push(action.payload);
      }
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter(c => c.city !== action.payload);
    },
    clearCompare: (state) => { state.compareList = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
        state.aqi = action.payload.aqi;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWeatherByCoords.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWeatherByCoords.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
        state.aqi = action.payload.aqi;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWeatherByCoords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchCities.pending, (state) => { state.searchLoading = true; })
      .addCase(searchCities.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCities.rejected, (state) => { state.searchLoading = false; });
  },
});

export const { clearError, clearSearch, addToCompare, removeFromCompare, clearCompare } = weatherSlice.actions;
export default weatherSlice.reducer;
