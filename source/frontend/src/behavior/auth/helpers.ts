import jwt, {jwtDecode, JwtPayload} from 'jwt-decode';
import {getAccessTokenFromLocalStorage } from './tokenService';

interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
}

function GetPayload() {
  const accessToken = getAccessTokenFromLocalStorage();
  if (!accessToken) return null;
  return jwtDecode(accessToken) as UserJwtPayload;
}

export function GetUserId() {
  const payload = GetPayload();
  if (!payload) return null;
  return payload["id"];
}

export function GetUserEmail() {
  const payload = GetPayload();
  if (!payload) return null;
  return payload["email"];
} 



