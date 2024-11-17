// src/tokenService.ts
const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';

export const saveTokensInLocalStorage = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
};

export const clearTokensInLocalStorage = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
}

export const getAccessTokenFromLocalStorage = () => localStorage.getItem(ACCESS_TOKEN) as string | null;
export const getRefreshTokenFromLocalStorage = () => localStorage.getItem(REFRESH_TOKEN) as string | null;

export const getAuthTokensFromLocalStorage = ( ) => 
    ({ accessToken: getAccessTokenFromLocalStorage(), refreshToken: getRefreshTokenFromLocalStorage() });
