import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from 'behavior/hooks';
import {setLoading, setTokens} from 'behavior/auth/authSlice';
import axios from 'axios';
import { RegisterApiRoute } from 'behavior/apiConstants';
import { Link } from 'react-router-dom';
import { loginRoute } from 'routing/constants';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      dispatch(setLoading(true));
      try {
        const response = await axios.post(RegisterApiRoute, values);
        const { accessToken, refreshToken } = response.data;
        dispatch(setTokens({ accessToken, refreshToken }));
        alert(response.data.message);
      } catch (error) {
        console.error('Registration failed:', error);
      } finally {
        dispatch(setLoading(false));
      }
    },
  });

  return (
    <div className="container mt-5">
      <form onSubmit={formik.handleSubmit} className="container mt-4">
        <h3>Register</h3>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          {formik.errors.name ? <div className="text-danger">{formik.errors.name}</div> : null}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
          {formik.errors.email ? <div className="text-danger">{formik.errors.email}</div> : null}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
          {formik.errors.password ? <div className="text-danger">{formik.errors.password}</div> : null}
        </div>
        <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : 'Register'}
        </button>
      </form>
      <Link to={loginRoute}>Login</Link>
    </div>
  );
};

export default Register;
