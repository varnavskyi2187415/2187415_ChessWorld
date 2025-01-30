// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearTokensInLocalStorage, saveTokensInLocalStorage } from './tokenService';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      saveTokensInLocalStorage(action.payload.accessToken, action.payload.refreshToken);
      state.isAuthenticated = true;
    },
    clearTokens: (state) => {
      clearTokensInLocalStorage()
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTokens, clearTokens, setLoading } = authSlice.actions;
export default authSlice.reducer;
