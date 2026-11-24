
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Customer information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check whether passwords match
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
const handleSubmit = async (e) => {
  e.preventDefault();

  // Check whether passwords match
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Check minimum password length
  if (password.length < 8) {
    alert('Password must be at least 8 characters.');
    return;
  }

  try {
    // Send customer information to backend
    const response = await fetch(
      'http://localhost:5000/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert('Account created successfully! Please sign in.');

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      navigate('/login');
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error('Signup error:', error);
    alert('Unable to connect to the server. Please try again.');
  }
};
  try {
    // Send customer information to backend
    const response = await fetch(
      'http://localhost:5000/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (response.ok) {

  alert('Account created successfully! Please sign in.');

  // Clear form fields
  setName('');
  setEmail('');
  setPassword('');
  setConfirmPassword('');

  // Redirect to Login page
  navigate('/login');

} else {
      alert(data.message);
    }

  } catch (error) {
    console.error('Signup error:', error);
    alert('Unable to connect to the server. Please try again.');
  }
};


  return (
    <div className="login-page">

      <div className="login-container">

        {/* Logo */}
        <Link to="/" className="login-logo">
          ZÉLORA<span>.</span>
        </Link>

        <p className="login-subtitle">
          JOIN ZÉLORA
        </p>

        <h1>Create Account</h1>

        <p className="login-description">
          Create your account and discover a personalized
          shopping experience.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="login-field">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Address */}
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

          {/* Password */}
          <div className="login-field">
            <label>Password</label>

            <div className="password-wrapper">
              <input
  type={showPassword ? 'text' : 'password'}
  placeholder="Create a password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  minLength={8}
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

          {/* Confirm Password */}
          <div className="login-field">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Create Account Button */}
          <button type="submit" className="login-button">
            CREATE ACCOUNT
          </button>

        </form>

        {/* Sign In Link */}
        <p className="login-description">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        {/* Back to Home */}
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>

    </div>
  );
};

export default Signup;
