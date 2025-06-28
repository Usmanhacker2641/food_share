import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Leaf, Loader2, Info, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>();

  // Check if Supabase is configured
  const isSupabaseConfigured = (): boolean => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return !(!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://placeholder.supabase.co' || 
      supabaseAnonKey === 'placeholder_key' ||
      supabaseUrl === 'your_supabase_url_here' || 
      supabaseAnonKey === 'your_supabase_anon_key_here');
  };

  const supabaseConfigured = isSupabaseConfigured();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      addNotification({
        type: 'success',
        title: 'Welcome back! 🎉',
        message: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3 text-primary-600">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-xl">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                FoodShare
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">Welcome back</h2>
            <p className="mt-2 text-neutral-600">
              Sign in to your account to continue sharing and caring
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            {supabaseConfigured ? (
              <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Connected to Supabase</p>
                    <p className="text-xs text-green-600">
                      {supabaseConfigured ? 'Create an account or use existing credentials' : 'Use demo accounts below'}
                    </p>
                  </div>
                </div>
                {supabaseConfigured && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 mb-2">
                      <strong>New to FoodShare?</strong> 
                      <Link to="/register" className="ml-1 underline hover:text-green-800">
                        Create your account here
                      </Link>
                    </p>
                    <p className="text-xs text-green-600">
                      Already have an account? Enter your email and password below.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-2">Demo Mode - Try These Accounts:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-700">Donor Account</p>
                          <p className="text-xs text-blue-600">donor@example.com</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount('donor@example.com', 'password123')}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Use This
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-700">Recipient Account</p>
                          <p className="text-xs text-blue-600">recipient@example.com</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount('recipient@example.com', 'password123')}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">Password for all demo accounts: password123</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Form */}
          <div className="rounded-3xl bg-white/80 backdrop-blur-lg p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary-600" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary-600" />
                    Password
                  </div>
                </label>
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 px-6 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-glow hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      Sign In
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Help */}
          {!supabaseConfigured && (
            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500">
                Running in demo mode. Connect to Supabase for full functionality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;