import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from 'behavior/hooks';
import { homeRoute } from './constants';

interface AuthRouteProps {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const to = searchParams.get('from') || homeRoute;
    if (isAuthenticated)
      navigate(to);
  }, [isAuthenticated, searchParams, navigate])
  return !isAuthenticated ? <>{children}</> : null;
};

export default AuthRoute;
