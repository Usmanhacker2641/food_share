import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Leaf, Loader2, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

interface LoginForm {
  email: string;
  password: string;
}

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !(!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://placeholder.supabase.co' || 
    supabaseAnonKey === 'placeholder_key' ||
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here');
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

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
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('Invalid credentials') ||
          error.message?.includes('invalid_credentials')) {
        if (isSupabaseConfigured()) {
          errorMessage = 'Invalid email or password. Please check your credentials or create a new account.';
        } else {
          errorMessage = 'Invalid credentials. Try using one of the demo accounts shown below or create a new account.';
        }
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      } else if (error.message?.includes('User not found')) {
        errorMessage = 'No account found with this email. Please register first or check your email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3 text-primary-600">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">FoodShare</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">Welcome back</h2>
            <p className="mt-2 text-neutral-600">
              Sign in to your account to continue making a difference
            </p>
          </div>

          {/* Demo Accounts Info */}
          {!supabaseConfigured && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Demo Accounts Available</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span><strong>Donor:</strong> donor@example.com</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">password123</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span><strong>Recipient:</strong> recipient@example.com</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">password123</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span><strong>Rider:</strong> rider@example.com</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">password123</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span><strong>Admin:</strong> admin@example.com</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">password123</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3 italic">
                    Click on any email to auto-fill the login form
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Supabase Status */}
          {supabaseConfigured && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Connected to Supabase</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
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
                  Password
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

                {supabaseConfigured && (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 px-6 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-glow hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
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
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Login Buttons for Demo */}
          {!supabaseConfigured && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'donor@example.com';
                    passwordInput.value = 'password123';
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Try Donor Account
              </button>
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'recipient@example.com';
                    passwordInput.value = 'password123';
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-secondary-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Try Recipient Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;