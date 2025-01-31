import axios from 'axios';
import {RefreshAccessApiRoute} from "./apiConstants";

// Create Axios instance
const apiClient = axios.create({
  baseURL: 'https://localhost', // Replace with your API base URL
  headers: { 'Content-Type': 'application/json' },
});

// Function to refresh the tokens
const refreshTokens = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken'); // Store your tokens securely
    const response = await axios.get(RefreshAccessApiRoute, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      }
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

// Request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 403 Forbidden
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        const newAccessToken = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest); // Retry request with new token
      } catch (refreshError) {
        console.error('Session expired. Logging out...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Redirect user to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
