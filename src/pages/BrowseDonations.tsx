import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, User, Heart, Star, Sparkles, Calendar, Package } from 'lucide-react';
import { getDonations, DonationWithImages, updateDonationStatus } from '../lib/api';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
        title: 'Request Sent! 🎉',
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

  const getExpiryColor = (days: number) => {
    if (days <= 1) return 'from-red-500 to-pink-500';
    if (days <= 3) return 'from-orange-500 to-yellow-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Discover Fresh Donations</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Browse Food
            </span>
            <br />
            <span className="text-neutral-900">Donations</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Find fresh food donations in your community and make a positive impact
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="mb-8 rounded-3xl bg-white/80 backdrop-blur-lg p-6 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search for delicious food donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white/50 py-4 pl-12 pr-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all duration-300 ${
                  selectedFilter === 'all'
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'bg-white/70 text-neutral-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <Filter className="h-4 w-4" />
                All ({donations.length})
              </button>
              <button
                onClick={() => setSelectedFilter('expiring-soon')}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all duration-300 ${
                  selectedFilter === 'expiring-soon'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white/70 text-neutral-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <Clock className="h-4 w-4" />
                Expiring Soon
              </button>
            </div>
          </div>
        </motion.div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-medium text-neutral-600">Loading delicious donations...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredDonations.map((donation, index) => {
                const daysUntilExpiry = getDaysUntilExpiry(donation.expiry_date);
                const isExpiringSoon = daysUntilExpiry <= 3;
                
                return (
                  <motion.div
                    key={donation.id}
                    className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    layout
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {donation.images && donation.images[0] ? (
                        <img
                          src={donation.images[0].url}
                          alt={donation.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 via-accent-100 to-secondary-100">
                          <Package className="h-16 w-16 text-primary-400" />
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Expiry badge */}
                      {isExpiringSoon && (
                        <div className={`absolute top-4 right-4 rounded-full bg-gradient-to-r ${getExpiryColor(daysUntilExpiry)} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
                          {daysUntilExpiry === 0 ? 'Expires Today!' : `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
                        </div>
                      )}

                      {/* Favorite button */}
                      <button className="absolute top-4 left-4 rounded-full bg-white/90 p-2 text-neutral-600 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-red-500 hover:scale-110">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="text-xl font-bold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {donation.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-neutral-600">4.8</span>
                        </div>
                      </div>
                      
                      <p className="mb-4 text-neutral-600 line-clamp-2 leading-relaxed">
                        {donation.description}
                      </p>
                      
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-primary-50 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-primary-600" />
                            <span className="text-xs font-medium text-primary-700">Quantity</span>
                          </div>
                          <p className="font-bold text-primary-900">{donation.quantity}</p>
                        </div>
                        <div className="rounded-xl bg-accent-50 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-accent-600" />
                            <span className="text-xs font-medium text-accent-700">Best Before</span>
                          </div>
                          <p className="font-bold text-accent-900">
                            {formatDate(donation.expiry_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4 flex items-start gap-2 rounded-xl bg-neutral-50 p-3">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-neutral-500" />
                        <span className="text-sm text-neutral-600">{donation.pickup_address}</span>
                      </div>

                      {donation.pickup_instructions && (
                        <div className="mb-4 rounded-xl bg-secondary-50 p-3">
                          <p className="text-xs font-medium text-secondary-700 mb-1">Pickup Instructions:</p>
                          <p className="text-sm text-secondary-600">{donation.pickup_instructions}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <User className="h-4 w-4" />
                          <span>Posted {formatDate(donation.created_at)}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleRequestFood(donation)}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Request Food
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {!isLoading && filteredDonations.length === 0 && (
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-accent-100">
              <Search className="h-12 w-12 text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No donations found</h3>
            <p className="text-lg text-neutral-600 max-w-md mx-auto">
              {searchTerm 
                ? `No food donations match "${searchTerm}". Try adjusting your search.`
                : 'No food donations are currently available. Check back later for fresh opportunities to help!'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BrowseDonations;