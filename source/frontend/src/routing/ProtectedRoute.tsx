import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'behavior/hooks';
import { toast } from 'react-toastify';
import { loginRoute } from './constants';

interface ProtectedRouteProps {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
  path?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, path }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated)
    toast.error("Please login or register to access requested page.");
  return isAuthenticated ? <>{children}</> : <Navigate to={loginRoute + `?from=${path}`} replace />;
};

export default ProtectedRoute;
