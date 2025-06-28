import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Package, CheckCircle, XCircle, Navigation, Loader2, MessageCircle, Truck, Route, Sparkles, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Loader } from '@googlemaps/js-api-loader';
import Chat from '../components/Chat';
import { motion, AnimatePresence } from 'framer-motion';

interface Pickup {
  id: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  donor: {
    name: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  recipient: {
    name: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  food: {
    description: string;
    quantity: string;
    expiryDate: string;
  };
  assignedAt?: string;
  completedAt?: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

// Mock data for demonstration
const mockPickups: Pickup[] = [
  {
    id: '1',
    status: 'pending',
    priority: 'high',
    estimatedTime: '15 mins',
    donor: {
      name: 'John Donor',
      address: '123 Main St, New York, NY',
      location: { lat: 40.7128, lng: -74.0060 }
    },
    recipient: {
      name: 'Community Center',
      address: '456 Oak Ave, New York, NY',
      location: { lat: 40.7589, lng: -73.9851 }
    },
    food: {
      description: 'Fresh vegetables and fruits',
      quantity: '5 kg',
      expiryDate: '2024-12-20'
    }
  },
  {
    id: '2',
    status: 'assigned',
    priority: 'medium',
    estimatedTime: '25 mins',
    donor: {
      name: 'Restaurant ABC',
      address: '789 Broadway, New York, NY',
      location: { lat: 40.7505, lng: -73.9934 }
    },
    recipient: {
      name: 'Food Bank',
      address: '321 Pine St, New York, NY',
      location: { lat: 40.7282, lng: -74.0776 }
    },
    food: {
      description: 'Prepared meals',
      quantity: '20 servings',
      expiryDate: '2024-12-19'
    },
    assignedAt: '2024-12-18T10:00:00Z'
  }
];

const RiderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickups, setPickups] = useState<Pickup[]>(mockPickups);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const locationWatchId = useRef<number | null>(null);

  // Redirect if not a rider
  useEffect(() => {
    if (user && user.role !== 'rider') {
      navigate('/');
    }
  }, [user, navigate]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.warn('Google Maps API key not found');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.006 },
            zoom: 12,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
              },
            ],
          });

          googleMapRef.current = map;
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#22C55E',
              strokeWeight: 6,
              strokeOpacity: 0.8,
            },
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Initialize location tracking
  useEffect(() => {
    if (navigator.geolocation) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );

      // Watch location changes
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error watching location:', error);
        }
      );
    }

    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);

  // Update markers and directions when pickup is selected or current location changes
  useEffect(() => {
    if (!googleMapRef.current || !selectedPickup || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const markers: google.maps.Marker[] = [];

    // Add current location marker (blue)
    if (currentLocation) {
      const currentLocationMarker = new google.maps.Marker({
        position: currentLocation,
        map: googleMapRef.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(40, 40),
        },
        title: 'Your Location',
      });
      markers.push(currentLocationMarker);
    }

    // Add donor marker (green for pickup)
    const donorMarker = new google.maps.Marker({
      position: selectedPickup.donor.location,
      map: googleMapRef.current,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
      title: `Pickup: ${selectedPickup.donor.name}`,
    });
    markers.push(donorMarker);

    // Add recipient marker (red for delivery)
    const recipientMarker = new google.maps.Marker({
      position: selectedPickup.recipient.location,
      map: googleMapRef.current,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
      title: `Delivery: ${selectedPickup.recipient.name}`,
    });
    markers.push(recipientMarker);

    markersRef.current = markers;

    // Calculate and display route
    if (currentLocation) {
      const directionsService = new google.maps.DirectionsService();
      const waypoints = [
        {
          location: selectedPickup.donor.location,
          stopover: true,
        },
      ];

      directionsService.route(
        {
          origin: currentLocation,
          destination: selectedPickup.recipient.location,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === 'OK' && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }
        }
      );
    }

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    if (currentLocation) bounds.extend(currentLocation);
    bounds.extend(selectedPickup.donor.location);
    bounds.extend(selectedPickup.recipient.location);
    googleMapRef.current.fitBounds(bounds);
  }, [selectedPickup, currentLocation]);

  if (!user) {
    return null;
  }

  const availablePickups = pickups.filter(p => p.status === 'pending');
  const assignedPickups = pickups.filter(p => p.status === 'assigned');

  const handleAcceptPickup = (pickup: Pickup) => {
    setPickups(prev => prev.map(p => 
      p.id === pickup.id 
        ? { ...p, status: 'assigned' as const, assignedAt: new Date().toISOString() }
        : p
    ));
    setSelectedPickup({ ...pickup, status: 'assigned' });
  };

  const handleCompletePickup = (pickup: Pickup) => {
    setPickups(prev => prev.map(p => 
      p.id === pickup.id 
        ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() }
        : p
    ));
    setSelectedPickup(null);
  };

  const handleCancelPickup = (pickup: Pickup) => {
    setPickups(prev => prev.map(p => 
      p.id === pickup.id 
        ? { ...p, status: 'pending' as const, assignedAt: undefined }
        : p
    ));
    setSelectedPickup(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-orange-500 to-yellow-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-primary-500 to-accent-500';
    }
  };

  const getPriorityBg = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-orange-50 border-orange-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-primary-50 border-primary-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 mb-4">
            <Truck className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Delivery Hero Dashboard</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Rider Dashboard
            </span>
          </h1>
          <p className="text-xl text-neutral-600">
            Manage your food pickup assignments and help reduce food waste in your community
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Pickups List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{availablePickups.length}</div>
                    <div className="text-sm opacity-90">Available</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-secondary-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{assignedPickups.length}</div>
                    <div className="text-sm opacity-90">Assigned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-2 shadow-lg border border-white/20">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('available')}
                    className={cn(
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                      activeTab === 'available'
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                    )}
                  >
                    Available Pickups ({availablePickups.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('assigned')}
                    className={cn(
                      'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                      activeTab === 'assigned'
                        ? 'bg-gradient-to-r from-secondary-500 to-pink-500 text-white shadow-lg'
                        : 'text-neutral-600 hover:text-secondary-600 hover:bg-secondary-50'
                    )}
                  >
                    My Assignments ({assignedPickups.length})
                  </button>
                </nav>
              </div>
            </div>

            {/* Pickup List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {(activeTab === 'available' ? availablePickups : assignedPickups).map((pickup, index) => (
                  <motion.div
                    key={pickup.id}
                    className={cn(
                      'group cursor-pointer rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                      selectedPickup?.id === pickup.id 
                        ? 'border-primary-500 ring-4 ring-primary-500/20 shadow-glow' 
                        : 'border-white/20 hover:border-primary-300'
                    )}
                    onClick={() => setSelectedPickup(pickup)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 p-2">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {pickup.food.description}
                          </h3>
                          <div className="flex items-center gap-2">
                            {pickup.priority && (
                              <span className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-white',
                                `bg-gradient-to-r ${getPriorityColor(pickup.priority)}`
                              )}>
                                <Star className="h-3 w-3" />
                                {pickup.priority.toUpperCase()}
                              </span>
                            )}
                            {pickup.estimatedTime && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                                <Clock className="h-3 w-3" />
                                {pickup.estimatedTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={cn('rounded-xl border p-3', getPriorityBg(pickup.priority))}>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Pickup Location</p>
                            <p className="text-sm text-green-700">{pickup.donor.address}</p>
                            <p className="text-xs text-green-600">{pickup.donor.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="flex items-start gap-2">
                          <Navigation className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-800">Delivery Location</p>
                            <p className="text-sm text-red-700">{pickup.recipient.address}</p>
                            <p className="text-xs text-red-600">{pickup.recipient.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm text-neutral-600">
                            Expires: {new Date(pickup.food.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-neutral-700">
                          Quantity: {pickup.food.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      {pickup.status === 'pending' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptPickup(pickup);
                          }}
                          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                          <span className="relative z-10">Accept Pickup</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      ) : pickup.status === 'assigned' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompletePickup(pickup);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelPickup(pickup);
                            }}
                            className="flex items-center gap-2 rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition-all duration-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowChat(!showChat);
                            }}
                            className="flex items-center gap-2 rounded-xl border-2 border-primary-500 bg-white px-4 py-2 text-sm font-semibold text-primary-500 transition-all duration-300 hover:bg-primary-50"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {showChat ? 'Hide Chat' : 'Chat'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(activeTab === 'available' ? availablePickups : assignedPickups).length === 0 && (
                <motion.div 
                  className="rounded-2xl bg-white/80 backdrop-blur-lg border border-white/20 p-8 text-center shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-100 to-accent-100">
                    <Package className="h-8 w-8 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {activeTab === 'available' ? 'No available pickups' : 'No assigned pickups'}
                  </h3>
                  <p className="text-neutral-600">
                    {activeTab === 'available'
                      ? 'Check back later for new pickup requests from your community'
                      : 'Accept some pickups to see them here and start making a difference'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Map and Chat */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Map */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-xl border border-white/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Route className="h-6 w-6 text-primary-600" />
                    Route Map
                  </h3>
                  {selectedPickup && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Route from {selectedPickup.donor.name} to {selectedPickup.recipient.name}
                    </p>
                  )}
                </div>
                {selectedPickup && (
                  <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-3 py-1 text-white">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Active Route</span>
                  </div>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex h-[500px] items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-accent-50">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500 mb-4" />
                    <p className="text-lg font-medium text-primary-600">Loading interactive map...</p>
                  </div>
                </div>
              ) : !import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <div className="flex h-[500px] items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <div className="text-center">
                    <MapPin className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <p className="text-lg font-medium text-neutral-600">Google Maps API key required</p>
                    <p className="text-sm text-neutral-500">Configure your API key to see the interactive map</p>
                  </div>
                </div>
              ) : (
                <div
                  ref={mapRef}
                  className="h-[500px] w-full rounded-xl shadow-inner"
                />
              )}

              {selectedPickup && !isLoading && (
                <div className="mt-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 p-4 border border-primary-200">
                  <h4 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Route Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg"></div>
                      <span className="text-sm font-medium text-green-800">Pickup: {selectedPickup.donor.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"></div>
                      <span className="text-sm font-medium text-red-800">Delivery: {selectedPickup.recipient.address}</span>
                    </div>
                    {currentLocation && (
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg"></div>
                        <span className="text-sm font-medium text-blue-800">Your current location</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat */}
            <AnimatePresence>
              {showChat && selectedPickup && (
                <motion.div 
                  className="rounded-2xl bg-white/80 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 400 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full">
                    <Chat
                      recipientId={selectedPickup.donor.id}
                      recipientName={selectedPickup.donor.name}
                      pickupId={selectedPickup.id}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;