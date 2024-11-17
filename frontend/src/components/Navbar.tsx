import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAppDispatch } from 'behavior/hooks';
import { clearTokens } from 'behavior/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(clearTokens());
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/home">ChessWorld</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>
        <div>
          <Outlet />
        </div>
        <ToastContainer />
      </main>
    </>
  );
};

export default Navbar;
