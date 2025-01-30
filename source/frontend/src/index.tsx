// src/index.tsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import App from './App';
import store from 'behavior/store'; // Make sure the path to your store file is correct
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling
import {setTokens} from 'behavior/auth/authSlice';
import {getAuthTokensFromLocalStorage} from 'behavior/auth/tokenService';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Navbar from "./components/Navbar";
import {gameRoute, homeRoute, loginRoute, registerRoute} from "./routing/constants";
import Home from "./pages/Home";
import AuthRoute from "./routing/AuthRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routing/ProtectedRoute";
import Game from "./pages/Game";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import axios from "axios";


// Get the root DOM element
const container = document.getElementById('root');
if (!container) {
  throw new Error("Couldn't find root element with id 'root'");
}

const {accessToken, refreshToken} = getAuthTokensFromLocalStorage();
if (accessToken && refreshToken)
  store.dispatch(setTokens({accessToken, refreshToken}));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement: <>not found</>,
    children: [
      {
        path: homeRoute,
        element: <ProtectedRoute children={<Home/>} path={homeRoute}/>,
      },
      {
        path: loginRoute,
        element: <AuthRoute children={<Login/>}/>,
      },
      {
        path: registerRoute,
        element: <AuthRoute children={<Register/>}/>,
      },
      {
        path: gameRoute,
        element: <ProtectedRoute children={<Game/>} path={gameRoute}/>,
      }
    ]
  }
], {
  future: {
    v7_skipActionErrorRevalidation: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true,
    v7_partialHydration: true,
  }
});

// Create a root and render the App
const root = createRoot(container);
root.render(
  <div style={{height: "100vh"}}>
    <Provider store={store}>
      <RouterProvider router={router} future={{v7_startTransition: true}} />
    </Provider>
  </div>
);
