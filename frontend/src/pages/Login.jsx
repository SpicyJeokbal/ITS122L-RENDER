// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../index.css';

const Login = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to role selection if no role specified
    if (!role || (role !== 'admin' && role !== 'scout')) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to workspace
        navigate('/workspace');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className={`auth-container-minimal ${isAdmin ? 'auth-admin' : 'auth-scout'}`}>
      <div className="auth-box-minimal">
        <div className="auth-back-btn" onClick={() => navigate('/')}>
          ← Back to role selection
        </div>

        <div className="auth-header-minimal">
          <div className="auth-role-badge">
            {isAdmin ? '👤 Admin' : '⛺ Scout'}
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-minimal">
          {error && (
            <div className="auth-error-minimal">
              {error}
            </div>
          )}

          <div className="form-group-minimal">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input-minimal"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group-minimal">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input-minimal"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn-auth-minimal ${isAdmin ? 'btn-admin' : 'btn-scout'}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-footer-minimal">
            Don't have an account? 
            <Link to={`/register/${role}`}> Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;