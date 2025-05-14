import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const { login } = useAuth();

  // Validate form on input change
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      
      if (touched.email && !formData.email) {
        newErrors.email = 'Email is required';
      } else if (
        touched.email && 
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
      ) {
        newErrors.email = 'Invalid email address';
      }
      
      if (touched.password && !formData.password) {
        newErrors.password = 'Password is required';
      } else if (touched.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      setErrors(newErrors);
    };
    
    validateForm();
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger validation
    setTouched({
      email: true,
      password: true
    });
    
    // Check if there are any validation errors
    if (!formData.email || !formData.password) {
      return;
    }
    
    setServerError('');
    
    try {
      setIsLoading(true);
      await login(formData);
      // Redirect is handled by the AuthContext and App.jsx
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-discord-bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-discord-header-primary mb-6 text-center">Welcome back!</h2>
      <p className="text-discord-header-secondary mb-6 text-center">We're so excited to see you again!</p>
      
      {serverError && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`bg-discord-bg-tertiary text-discord-text-normal w-full p-2.5 rounded focus:outline-none focus:ring-2 ${
              errors.email ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-discord-primary'
            }`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-discord-interactive-normal text-xs font-bold uppercase mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`bg-discord-bg-tertiary text-discord-text-normal w-full p-2.5 rounded focus:outline-none focus:ring-2 ${
              errors.password ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-discord-primary'
            }`}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}
          <div className="mt-1">
            <Link to="/forgot-password" className="text-xs text-discord-text-link hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0}
          className="w-full bg-discord-primary hover:bg-discord-blurple-dark text-white font-medium p-3 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : 'Log In'}
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