import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-error-100 p-4">
            <AlertCircle className="h-12 w-12 text-error-500" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-neutral-900">Page Not Found</h1>
        <p className="mb-8 text-lg text-neutral-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;