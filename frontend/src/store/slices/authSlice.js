import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import weatherApi from '../../services/weatherApi';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await weatherApi.login(credentials);
    localStorage.setItem('skypulse-token', response.data.access);
    localStorage.setItem('skypulse-refresh', response.data.refresh);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await weatherApi.register(data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('skypulse-token'),
    user: null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('skypulse-token'),
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('skypulse-token');
      localStorage.removeItem('skypulse-refresh');
    },
    clearAuthError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
