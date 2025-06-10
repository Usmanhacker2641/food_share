import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Apple, ShoppingBag, Truck } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] bg-gradient-to-b from-primary-50 to-white px-4 pt-32 pb-16">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-neutral-900">
              Share Food,{' '}
              <span className="text-primary-600">Save Lives</span>
            </h1>
            <p className="mb-8 text-lg text-neutral-600">
              Join our community in reducing food waste while helping those in need.
              Connect with local donors, recipients, and volunteer riders to make a difference.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-secondary-600"
              >
                Start Donating
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Browse Donations
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Donate Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Apple className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Donate Surplus Food
              </h3>
              <p className="text-neutral-600">
                List your surplus food items for donation. Help reduce waste and feed those in need.
              </p>
            </div>

            {/* Request Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
                <ShoppingBag className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Request Donations
              </h3>
              <p className="text-neutral-600">
                Browse available donations and request items for your community or organization.
              </p>
            </div>

            {/* Deliver Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
                <Truck className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Volunteer to Deliver
              </h3>
              <p className="text-neutral-600">
                Join our network of volunteer riders to help collect and deliver food donations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;