import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'behavior/hooks';

interface PublicRouteProps {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default PublicRoute;
