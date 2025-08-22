import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mic } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    clearError();

    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/dashboard-home');
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
            Sign in to KaraokeWeb
          </h2>
          <p className="mt-2 text-sm text-purple-200">
            Or{' '}
            <Link
              to="/auth/signup"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-white/20 border-purple-300 text-white placeholder-purple-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e?.target?.value)}
              />
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-purple-200">
              Demo credentials: demo@karaoke.app / karaoke2024!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;