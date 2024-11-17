import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from 'behavior/hooks';
import { setLoading, setTokens } from 'behavior/auth/authSlice';
import axios from 'axios';
import { LoginApiRoute } from 'behavior/apiConstants';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerRoute } from 'routing/constants';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      dispatch(setLoading(true));
      try {
        const response = await axios.post(LoginApiRoute, values);
        const { accessToken, refreshToken } = response.data;
        dispatch(setTokens({ accessToken, refreshToken }));
        toast.success('Login successful!');
        if (searchParams.has('from')) {
          navigate(searchParams.get('from')!);
        }
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Login failed. Please try again.');
      } finally {
        dispatch(setLoading(false));
      }
    },
  });

  return (
    <div className="container mt-5">
      <form onSubmit={formik.handleSubmit} className="container mt-4">
        <h3>Login</h3>
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
          {formik.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : 'Login'}
        </button>
      </form>
      <Link to={registerRoute}>Register</Link>
    </div>
  );
};

export default Login;
