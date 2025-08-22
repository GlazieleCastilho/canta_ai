import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mic } from 'lucide-react';

export function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { signUp, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData?.username?.trim()) {
      errors.username = 'Username is required';
    } else if (formData?.username?.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData?.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData?.email, formData?.password, {
      full_name: formData?.fullName,
      username: formData?.username
    });
    
    if (!error) {
      // Show success message and redirect
      alert('Account created successfully! You can now sign in.');
      navigate('/auth/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Join KaraokeWeb
          </h2>
          <p className="mt-2 text-sm text-purple-200">
            Or{' '}
            <Link
              to="/auth/login"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Full Name"
                value={formData?.fullName}
                onChange={handleChange}
              />
              {validationErrors?.fullName && (
                <p className="mt-1 text-sm text-red-300">{validationErrors?.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Username"
                value={formData?.username}
                onChange={handleChange}
              />
              {validationErrors?.username && (
                <p className="mt-1 text-sm text-red-300">{validationErrors?.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Email address"
                value={formData?.email}
                onChange={handleChange}
              />
              {validationErrors?.email && (
                <p className="mt-1 text-sm text-red-300">{validationErrors?.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Password"
                value={formData?.password}
                onChange={handleChange}
              />
              {validationErrors?.password && (
                <p className="mt-1 text-sm text-red-300">{validationErrors?.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Confirm Password"
                value={formData?.confirmPassword}
                onChange={handleChange}
              />
              {validationErrors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">{validationErrors?.confirmPassword}</p>
              )}
            </div>
          </div>

          {authError && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md text-sm">
              {authError}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;