import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { User, Camera, Loader2, MapPin, Package, Heart, Clock, Gift, Star, TrendingUp } from 'lucide-react';
import { getUserDonations, getUserRequests, DonationWithImages } from '../lib/api';
import { formatDate } from '../lib/utils';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'donations' | 'requests'>('profile');
  const [userDonations, setUserDonations] = useState<DonationWithImages[]>([]);
  const [userRequests, setUserRequests] = useState<DonationWithImages[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.location?.address || '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load user's donations and requests
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setIsLoadingData(true);
      try {
        const [donations, requests] = await Promise.all([
          getUserDonations(user.id),
          getUserRequests(user.id)
        ]);
        setUserDonations(donations);
        setUserRequests(requests);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        ...user,
        name: formData.name,
        location: {
          ...user.location,
          address: formData.address,
        },
        ...(previewImage && { profileImage: previewImage }),
      });

      addNotification({
        type: 'success',
        title: 'Profile Updated! ✨',
        message: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      icon: Package,
      label: 'Donations Made',
      value: userDonations.length,
      color: 'from-primary-500 to-accent-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Heart,
      label: 'Food Requested',
      value: userRequests.length,
      color: 'from-secondary-500 to-pink-500',
      bgColor: 'bg-secondary-50',
    },
    {
      icon: Star,
      label: 'Impact Score',
      value: (userDonations.length * 10 + userRequests.length * 5),
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: TrendingUp,
      label: 'Community Rank',
      value: userDonations.length > 5 ? 'Gold' : userDonations.length > 2 ? 'Silver' : 'Bronze',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Profile Settings
              </span>
            </h1>
            <p className="text-xl text-neutral-600">
              Manage your account and track your community impact
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className={`rounded-2xl ${stat.bgColor} p-4 border border-white/50`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl bg-gradient-to-r ${stat.color} p-2`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-neutral-900">{stat.value}</div>
                    <div className="text-xs text-neutral-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-2 shadow-lg border border-white/20">
              <nav className="flex space-x-2">
                {[
                  { id: 'profile', label: 'Profile Info', icon: User },
                  { id: 'donations', label: 'My Donations', icon: Package },
                  { id: 'requests', label: 'My Requests', icon: Heart },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'profile' && (
              <div className="rounded-3xl bg-white/80 backdrop-blur-lg p-8 shadow-xl border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-r from-primary-100 to-accent-100 ring-4 ring-white shadow-lg">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={formData.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-full w-full p-4 text-primary-400" />
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg transition-all duration-300 hover:scale-110"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">Profile Photo</h3>
                      <p className="text-sm text-neutral-600">
                        Upload a new profile photo to personalize your account
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-6 py-4 text-neutral-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-2 text-sm text-neutral-500">
                      Email cannot be changed for security reasons
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-neutral-700 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        Address
                      </div>
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-glow hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <User className="h-5 w-5" />
                            Save Changes
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-900">My Donations</h2>
                  <div className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-white font-medium">
                    {userDonations.length} donations
                  </div>
                </div>
                
                {isLoadingData ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : userDonations.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {userDonations.map((donation) => (
                      <div key={donation.id} className="rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-white/20">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-neutral-900">{donation.title}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-neutral-600 mb-4 line-clamp-2">{donation.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-medium text-neutral-500">Quantity</p>
                            <p className="font-semibold text-neutral-900">{donation.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500">Posted</p>
                            <p className="font-semibold text-neutral-900">{formatDate(donation.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{donation.pickup_address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-8 text-center shadow-lg border border-white/20">
                    <Package className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">No donations yet</h3>
                    <p className="text-neutral-600 mb-4">Start making a difference by donating food to your community</p>
                    <button
                      onClick={() => navigate('/donate')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <Gift className="h-4 w-4" />
                      Make Your First Donation
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-900">My Requests</h2>
                  <div className="rounded-full bg-gradient-to-r from-secondary-500 to-pink-500 px-4 py-2 text-white font-medium">
                    {userRequests.length} requests
                  </div>
                </div>
                
                {isLoadingData ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : userRequests.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {userRequests.map((request) => (
                      <div key={request.id} className="rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-white/20">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-neutral-900">{request.title}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-neutral-600 mb-4 line-clamp-2">{request.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-medium text-neutral-500">Quantity</p>
                            <p className="font-semibold text-neutral-900">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500">Requested</p>
                            <p className="font-semibold text-neutral-900">{formatDate(request.updated_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{request.pickup_address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-8 text-center shadow-lg border border-white/20">
                    <Heart className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">No requests yet</h3>
                    <p className="text-neutral-600 mb-4">Browse available donations and request food for your community</p>
                    <button
                      onClick={() => navigate('/browse')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-secondary-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <Heart className="h-4 w-4" />
                      Browse Donations
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;