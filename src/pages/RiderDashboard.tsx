import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Package, CheckCircle, XCircle, Navigation, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Loader } from '@googlemaps/js-api-loader';
import Chat from '../components/Chat';

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
}

// Mock data for demonstration
const mockPickups: Pickup[] = [
  {
    id: '1',
    status: 'pending',
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
            ],
          });

          googleMapRef.current = map;
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#6DBF84',
              strokeWeight: 4,
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
          scaledSize: new google.maps.Size(32, 32),
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
        scaledSize: new google.maps.Size(32, 32),
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
        scaledSize: new google.maps.Size(32, 32),
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

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Rider Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Manage your food pickup assignments and help reduce food waste
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Pickups List */}
        <div>
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-neutral-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('available')}
                  className={cn(
                    'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                    activeTab === 'available'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  )}
                >
                  Available Pickups ({availablePickups.length})
                </button>
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={cn(
                    'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                    activeTab === 'assigned'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  )}
                >
                  My Assignments ({assignedPickups.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Pickup List */}
          <div className="space-y-4">
            {(activeTab === 'available' ? availablePickups : assignedPickups).map((pickup) => (
              <div
                key={pickup.id}
                className={cn(
                  'cursor-pointer rounded-lg border bg-white p-6 shadow-card transition-all hover:shadow-card-hover',
                  selectedPickup?.id === pickup.id ? 'border-primary-500 ring-2 ring-primary-100' : 'border-neutral-200'
                )}
                onClick={() => setSelectedPickup(pickup)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary-500" />
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {pickup.food.description}
                      </h3>
                      <span className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        pickup.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                        pickup.status === 'assigned' ? 'bg-primary-100 text-primary-800' :
                        'bg-success-100 text-success-800'
                      )}>
                        {pickup.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-success-500" />
                        <div>
                          <p className="font-medium text-neutral-700">Pickup Location</p>
                          <p className="text-sm text-neutral-600">{pickup.donor.address}</p>
                          <p className="text-xs text-neutral-500">{pickup.donor.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Navigation className="mt-1 h-5 w-5 flex-shrink-0 text-error-500" />
                        <div>
                          <p className="font-medium text-neutral-700">Delivery Location</p>
                          <p className="text-sm text-neutral-600">{pickup.recipient.address}</p>
                          <p className="text-xs text-neutral-500">{pickup.recipient.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600">
                            Expires: {new Date(pickup.food.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-neutral-700">
                          Quantity: {pickup.food.quantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-2">
                    {pickup.status === 'pending' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptPickup(pickup);
                        }}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                      >
                        Accept Pickup
                      </button>
                    ) : pickup.status === 'assigned' ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompletePickup(pickup);
                          }}
                          className="flex items-center gap-2 rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelPickup(pickup);
                          }}
                          className="flex items-center gap-2 rounded-lg border border-error-500 px-4 py-2 text-sm font-medium text-error-500 transition-colors hover:bg-error-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowChat(!showChat);
                          }}
                          className="flex items-center gap-2 rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {showChat ? 'Hide Chat' : 'Show Chat'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {(activeTab === 'available' ? availablePickups : assignedPickups).length === 0 && (
              <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-4 text-lg font-medium text-neutral-900">
                  {activeTab === 'available' ? 'No available pickups' : 'No assigned pickups'}
                </h3>
                <p className="mt-2 text-neutral-600">
                  {activeTab === 'available'
                    ? 'Check back later for new pickup requests'
                    : 'Accept some pickups to see them here'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map and Chat */}
        <div className="space-y-4">
          {/* Map */}
          <div className="relative rounded-lg bg-white p-4 shadow-card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Route Map</h3>
              {selectedPickup && (
                <p className="text-sm text-neutral-600">
                  Route from {selectedPickup.donor.name} to {selectedPickup.recipient.name}
                </p>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex h-[600px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
                  <p className="mt-2 text-sm text-neutral-600">Loading map...</p>
                </div>
              </div>
            ) : !import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <div className="flex h-[600px] items-center justify-center rounded-lg bg-neutral-100">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-2 text-neutral-600">Google Maps API key required</p>
                </div>
              </div>
            ) : (
              <div
                ref={mapRef}
                className="h-[600px] w-full rounded-lg"
              />
            )}

            {selectedPickup && !isLoading && (
              <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                <h4 className="font-medium text-neutral-900">Route Information</h4>
                <div className="mt-2 space-y-1 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success-500"></div>
                    <span>Pickup: {selectedPickup.donor.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-error-500"></div>
                    <span>Delivery: {selectedPickup.recipient.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          {showChat && selectedPickup && (
            <div className="h-[400px] rounded-lg bg-white p-4 shadow-card">
              <Chat
                recipientId={selectedPickup.donor.id}
                recipientName={selectedPickup.donor.name}
                pickupId={selectedPickup.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;