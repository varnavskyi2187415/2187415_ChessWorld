import axios, {AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {RefreshAccessApiRoute} from "./apiConstants";
import {
  clearTokensInLocalStorage,
  getRefreshTokenFromLocalStorage,
  saveTokensInLocalStorage
} from "./auth/tokenService";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

const apiClient: AxiosInstance = axios.create({
  baseURL: "https://localhost",
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshTokenFromLocalStorage();
        if (!refreshToken) throw new Error("Refresh token not available");

        const { data } = await axios.post(RefreshAccessApiRoute, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
        saveTokensInLocalStorage(newAccessToken, newRefreshToken);

        apiClient.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokensInLocalStorage();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
