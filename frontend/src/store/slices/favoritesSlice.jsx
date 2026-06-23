import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import weatherApi from '../../services/weatherApi';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (_, { rejectWithValue }) => {
  try {
    const response = await weatherApi.getFavorites();
    return response.data;
  } catch (err) {
    // Fallback to local storage if not authenticated
    const local = JSON.parse(localStorage.getItem('skypulse-favorites') || '[]');
    return local;
  }
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async (city, { rejectWithValue }) => {
  try {
    await weatherApi.addFavorite(city);
    return city;
  } catch (err) {
    return city; // Optimistic - add locally
  }
});

export const removeFavorite = createAsyncThunk('favorites/removeFavorite', async (city, { rejectWithValue }) => {
  try {
    await weatherApi.removeFavorite(city);
    return city;
  } catch (err) {
    return city;
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: JSON.parse(localStorage.getItem('skypulse-favorites') || '[]'),
    loading: false,
    error: null,
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const city = action.payload;
      const idx = state.items.indexOf(city);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(city);
      }
      localStorage.setItem('skypulse-favorites', JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (!state.items.includes(action.payload)) {
          state.items.push(action.payload);
          localStorage.setItem('skypulse-favorites', JSON.stringify(state.items));
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i !== action.payload);
        localStorage.setItem('skypulse-favorites', JSON.stringify(state.items));
      });
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
