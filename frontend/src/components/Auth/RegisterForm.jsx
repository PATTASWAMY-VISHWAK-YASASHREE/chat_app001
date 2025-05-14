import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      // Redirect is handled by the AuthContext and App.jsx
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-discord-bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-discord-header-primary mb-6 text-center">Create an account</h2>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="bg-discord-bg-tertiary text-discord-text-normal w-full p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Email <span className="text-red-500">*</span>
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
        
        <div className="mb-4">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Password <span className="text-red-500">*</span>
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
        
        <div className="mb-6">
          <label className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
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
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-discord-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-discord-text-link hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;