// src/features/auth/authUtils.ts
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import store from 'behavior/store';
import { setTokens, clearTokens } from 'behavior/auth/authSlice';
import { getAuthTokensFromLocalStorage } from './tokenService';
import { RefreshAccessApiRoute } from 'behavior/apiConstants';

interface JwtPayload {
  exp: number;
}

/// TODO: check time diff determining logic 
export const isTokenExpired = (token: string): boolean => {
  const decoded: JwtPayload = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
};

export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(async (config) => {
    const { accessToken: savedAccessToken, refreshToken: savedRefreshToken } = getAuthTokensFromLocalStorage();
    if (savedRefreshToken && isTokenExpired(savedAccessToken || '')) {
      try {
        const response = await axios.get(RefreshAccessApiRoute, {
          headers: { Authorization: savedRefreshToken },
        });
        const { accessToken, refreshToken } = response.data;
        store.dispatch(setTokens({ accessToken, refreshToken }));
        config.headers.Authorization = `Bearer ${accessToken}`;
      } catch (error) {
        store.dispatch(clearTokens());
        console.error('Token refresh failed');
      }
    }
    return config;
  });
};
