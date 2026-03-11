// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../index.css';

const Register = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: role === 'admin' ? 'leader' : 'scout'
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          navigate(`/login/${role}`);
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className={`auth-container-minimal ${isAdmin ? 'auth-admin' : 'auth-scout'}`}>
      <div className="auth-box-minimal auth-box-register">
        <div className="auth-back-btn" onClick={() => navigate('/')}>
          ← Back to role selection
        </div>

        <div className="auth-header-minimal">
          <div className="auth-role-badge">
            {isAdmin ? '👤 Admin' : '⛺ Scout'}
          </div>
          <h1>Create Account</h1>
          <p>Join the task management system</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-minimal">
          {error && (
            <div className="auth-error-minimal">
              {error}
            </div>
          )}

          <div className="form-row-2col">
            <div className="form-group-minimal">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-input-minimal"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group-minimal">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-input-minimal"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
            />
          </div>

          <div className="form-group-minimal">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input-minimal"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-minimal">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input-minimal"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn-auth-minimal ${isAdmin ? 'btn-admin' : 'btn-scout'}`}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-footer-minimal">
            Already have an account? 
            <Link to={`/login/${role}`}> Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;