import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { User } from '../types';
import { RootState } from './store';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: !!(typeof window !== 'undefined' && localStorage.getItem('token')),
    status: 'idle',
    error: null,
};

// Async Thunks
export const signupUser = createAsyncThunk('auth/signup', async (userData: any, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.detail || 'Signup failed');
        }
        return await response.json();
    } catch (error) {
        return rejectWithValue('An unknown error occurred during signup');
    }
});

export const loginUser = createAsyncThunk('auth/login', async (userData: any, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(userData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.detail || 'Login failed');
        }
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        return data;
    } catch (error) {
        return rejectWithValue('An unknown error occurred during login');
    }
});

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.detail || 'Registration failed');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue('An unknown error occurred during registration');
        }
    }
);

export const checkUserSession = createAsyncThunk<User, void, { rejectValue: string }>(
    'auth/checkUserSession',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // The api instance will automatically use the token from localStorage via the interceptor
                const response = await api.get('/auth/me');
                return response.data;
            } catch (error: any) {
                localStorage.removeItem('token');
                return rejectWithValue(error.response?.data?.detail || 'Session expired');
            }
        }
        return rejectWithValue('No token found');
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      toast.info("You have been logged out.");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => { state.status = 'loading'; })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        toast.success("Signup successful! Please log in.");
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast.error(`Signup Failed: ${action.payload}`);
      })
      .addCase(loginUser.pending, (state) => { state.status = 'loading'; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        toast.success("Login Successful!");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast.error(`Login Failed: ${action.payload}`);
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ access_token: string; user: User }>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.access_token);
      })
      .addCase(checkUserSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkUserSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkUserSession.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
        }
      );
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token; 