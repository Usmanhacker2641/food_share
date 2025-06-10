import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, User } from 'lucide-react';
import { getDonations, DonationWithImages, updateDonationStatus } from '../lib/api';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const BrowseDonations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [donations, setDonations] = useState<DonationWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await getDonations();
        setDonations(data);
      } catch (error) {
        console.error('Error fetching donations:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load donations. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [addNotification]);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'expiring-soon') {
      const daysUntilExpiry = Math.ceil((new Date(donation.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return matchesSearch && daysUntilExpiry <= 3;
    }
    return matchesSearch;
  });

  const handleRequestFood = async (donation: DonationWithImages) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please log in to request food donations.',
      });
      return;
    }

    if (!user) return;

    try {
      await updateDonationStatus(donation.id, 'claimed', user.id);
      
      // Update local state
      setDonations(prev => prev.filter(d => d.id !== donation.id));
      
      addNotification({
        type: 'success',
        title: 'Request Sent',
        message: 'Your food request has been sent to the donor.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to request food. Please try again.',
      });
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-neutral-900">Browse Food Donations</h1>
          <p className="mt-2 text-lg text-neutral-600">
            Find fresh food donations in your community
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for food donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                All ({donations.length})
              </button>
              <button
                onClick={() => setSelectedFilter('expiring-soon')}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 transition-colors ${
                  selectedFilter === 'expiring-soon'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Expiring Soon
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-neutral-600">Loading donations...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonations.map((donation) => {
              const daysUntilExpiry = getDaysUntilExpiry(donation.expiry_date);
              const isExpiringSoon = daysUntilExpiry <= 3;
              
              return (
                <div
                  key={donation.id}
                  className="overflow-hidden rounded-lg bg-white shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {donation.images && donation.images[0] ? (
                      <img
                        src={donation.images[0].url}
                        alt={donation.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <span className="text-primary-600 font-medium">No image available</span>
                      </div>
                    )}
                    
                    {isExpiringSoon && (
                      <div className="absolute top-3 right-3 rounded-full bg-warning-500 px-3 py-1 text-xs font-medium text-white">
                        Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-neutral-900 line-clamp-2">
                      {donation.title}
                    </h3>
                    <p className="mb-4 text-neutral-600 line-clamp-3">
                      {donation.description}
                    </p>
                    
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Quantity</p>
                        <p className="font-semibold text-neutral-900">{donation.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Best Before</p>
                        <p className="font-semibold text-neutral-900">
                          {formatDate(donation.expiry_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4 flex items-start gap-2 text-neutral-600">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{donation.pickup_address}</span>
                    </div>

                    {donation.pickup_instructions && (
                      <div className="mb-4 rounded-lg bg-neutral-50 p-3">
                        <p className="text-sm font-medium text-neutral-700">Pickup Instructions:</p>
                        <p className="text-sm text-neutral-600">{donation.pickup_instructions}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <User className="h-4 w-4" />
                        <span>Posted {formatDate(donation.created_at)}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleRequestFood(donation)}
                        className="rounded-lg bg-secondary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                      >
                        Request Food
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredDonations.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">No donations found</h3>
            <p className="mt-2 text-neutral-600">
              {searchTerm 
                ? `No food donations match "${searchTerm}". Try adjusting your search.`
                : 'No food donations are currently available. Check back later!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseDonations;