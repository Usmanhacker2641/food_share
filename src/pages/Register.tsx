import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Mail, Lock, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'donor' | 'recipient' | 'rider';
  address?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(
        {
          name: data.name,
          email: data.email,
          role: data.role,
          location: data.address
            ? {
                address: data.address,
                lat: 0, // In a real app, we would geocode the address
                lng: 0,
              }
            : undefined,
        },
        data.password
      );

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Registration successful! Welcome to FoodShare.',
      });

      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error instanceof Error ? error.message : 'An error occurred during registration',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <div className="rounded-lg bg-white py-8 px-4 shadow-card sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    type="password"
                    className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'The passwords do not match',
                    })}
                    type="password"
                    className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                  I want to...
                </label>
                <select
                  {...register('role', { required: 'Please select a role' })}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select a role</option>
                  <option value="donor">Donate Food</option>
                  <option value="recipient">Receive Food</option>
                  <option value="rider">Deliver Food</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-error-500">{errors.role.message}</p>
                )}
              </div>

              {/* Address (Optional) */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
                  Address (Optional)
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('address')}
                    type="text"
                    className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-primary-600 py-2 px-4 text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;