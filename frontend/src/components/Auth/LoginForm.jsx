import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(formData);
      // Redirect is handled by the AuthContext and App.jsx
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-discord-bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-discord-header-primary mb-6 text-center">Welcome back!</h2>
      <p className="text-discord-header-secondary mb-6 text-center">We're so excited to see you again!</p>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-discord-bg-tertiary text-discord-text-normal w-full p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-discord-bg-tertiary text-discord-text-normal w-full p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-discord-primary hover:bg-discord-blurple-dark text-white font-medium p-3 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-discord-text-muted">
        Need an account?{' '}
        <Link to="/register" className="text-discord-text-link hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;