import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Navbar from 'components/Navbar';
import Login from 'pages/Login';
import Register from 'pages/Register';
import Home from 'pages/Home';
import ProtectedRoute from 'routing/ProtectedRoute';
import { gameRoute, homeRoute, loginRoute, registerRoute } from 'routing/constants';
import AuthRoute from 'routing/AuthRoute';
import Game from 'pages/Game';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    errorElement: <>not found</>,
    children: [
      {
        path: homeRoute,
        element: <Home />,
      },
      {
        path: loginRoute,
        element: <AuthRoute children={<Login />} />,
      },
      {
        path: registerRoute,
        element: <AuthRoute children={<Register />} />,
      },
      {
        path: gameRoute,
        element: <ProtectedRoute children={<Game />} path={gameRoute} />,
      }
    ]
  }
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;
