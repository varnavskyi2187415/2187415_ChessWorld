import React from 'react';
import { BrowserRouter, Routes, Route, createBrowserRouter, RouteObject, RouterProvider, Router } from 'react-router-dom';
import Navbar from 'components/Navbar';
import Login from 'pages/Login';
import Register from 'pages/Register';
import Home from 'pages/Home';
import ProtectedRoute from 'routing/ProtectedRoute';
import { homeRoute, loginRoute, registerRoute } from 'routing/constants';
import PublicRoute from 'routing/PublicRoute';

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbar />}>
            <Route path={homeRoute} element={<ProtectedRoute children={<Home />} path={homeRoute} />} />
            <Route path={loginRoute} element={<PublicRoute children={<Login />}/>} />
            <Route path={registerRoute} element={<PublicRoute children={<Register />} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
