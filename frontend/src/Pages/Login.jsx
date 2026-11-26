
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const Login = () => {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'Login failed.');
}

login(data);

navigate('/');

} catch (error) {

  setError(error.message);

} finally {

  setLoading(false);

}

  };

  return (

    <div className="login-page">

      <div className="login-container">

        <Link to="/" className="login-logo">
          ZÉLORA<span>.</span>
        </Link>

        <p className="login-subtitle">
          WELCOME BACK
        </p>

        <h1>Sign In</h1>

        <p className="login-description">
          Don't have an account?{' '}
          <Link to="/signup">Create Account</Link>
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-field">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="login-field">

            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>

            </div>

          </div>

          {error && (
            <p style={{ color: 'red' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

        </form>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>

    </div>

  );

};

export default Login;
