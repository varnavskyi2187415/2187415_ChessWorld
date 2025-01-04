import {jwtDecode, JwtPayload} from "jwt-decode";

interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
}

function GetPayload(accessToken: string) {
  if (!accessToken) return null;
  return jwtDecode(accessToken) as UserJwtPayload;
}

export function GetUserId(accessToken: string) {
  const payload = GetPayload(accessToken);
  if (!payload) return null;
  return payload["id"];
}

export function GetUserEmail(accessToken: string) {
  const payload = GetPayload(accessToken);
  if (!payload) return null;
  return payload["email"];
}

export function GetUserIdFromReq(request: Request) {
  const jwt = (request.headers as any).authorization.replace('Bearer ', '');
  return GetUserId(jwt);
}