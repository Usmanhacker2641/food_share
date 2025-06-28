import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'donor' | 'recipient' | 'rider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// UUID validation function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Mock user data - in a real app, this would come from your backend
const MOCK_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'John Donor',
    email: 'donor@example.com',
    password: 'password123',
    role: 'donor' as UserRole,
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Donation St, New York, NY',
    },
    profileImage: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Sarah Recipient',
    email: 'recipient@example.com',
    password: 'password123',
    role: 'recipient' as UserRole,
    location: {
      lat: 40.7228,
      lng: -73.9860,
      address: '456 Need Ave, New York, NY',
    },
    profileImage: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Mike Rider',
    email: 'rider@example.com',
    password: 'password123',
    role: 'rider' as UserRole,
    location: {
      lat: 40.7328,
      lng: -73.9960,
      address: '789 Delivery Rd, New York, NY',
    },
    profileImage: 'https://i.pravatar.cc/150?img=8',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    profileImage: 'https://i.pravatar.cc/150?img=12',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper function to create user object from Supabase data
  const createUserFromSupabase = (authUser: any, userProfile?: any): User => {
    return {
      id: authUser.id,
      name: userProfile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: (userProfile?.role || authUser.user_metadata?.role || 'recipient') as UserRole,
      ...(userProfile?.location_address && {
        location: {
          lat: userProfile.location_lat || 0,
          lng: userProfile.location_lng || 0,
          address: userProfile.location_address,
        }
      }),
      ...(userProfile?.profile_image && { profileImage: userProfile.profile_image }),
    };
  };

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user profile:', error);
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
          } else if (session?.user) {
            // Fetch user profile from users table
            const userProfile = await fetchUserProfile(session.user.id);
            const supabaseUser = createUserFromSupabase(session.user, userProfile);
            setUser(supabaseUser);
          }
        } catch (error) {
          console.error('Error initializing Supabase auth:', error);
        }
      } else {
        // Fall back to mock authentication
        const savedUser = localStorage.getItem('foodShareUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            
            // Validate that the user ID is a proper UUID
            if (parsedUser.id && isValidUUID(parsedUser.id)) {
              setUser(parsedUser);
            } else {
              // Clear invalid user data from localStorage
              console.warn('Invalid user ID format detected, clearing localStorage');
              localStorage.removeItem('foodShareUser');
              setUser(null);
            }
          } catch (error) {
            // Clear corrupted data from localStorage
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('foodShareUser');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Set up auth state listener for Supabase
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            // Fetch user profile from users table
            const userProfile = await fetchUserProfile(session.user.id);
            const supabaseUser = createUserFromSupabase(session.user, userProfile);
            setUser(supabaseUser);
          } else {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Provide more specific error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            throw new Error(`Login failed: ${error.message}`);
          }
        }

        if (data.user) {
          // Fetch user profile from users table
          const userProfile = await fetchUserProfile(data.user.id);
          const supabaseUser = createUserFromSupabase(data.user, userProfile);
          setUser(supabaseUser);
        }
      } else {
        // Fall back to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (!foundUser) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        // Remove password before storing user data
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('foodShareUser', JSON.stringify(userWithoutPassword));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signUp({
          email: userData.email || '',
          password,
          options: {
            data: {
              name: userData.name,
              role: userData.role || 'recipient',
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please try logging in instead.');
          } else if (error.message.includes('Password should be at least')) {
            throw new Error('Password must be at least 6 characters long.');
          } else {
            throw new Error(`Registration failed: ${error.message}`);
          }
        }

        if (data.user) {
          // Wait a moment for the trigger to create the user profile
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update the user profile with additional data if provided
          if (userData.location || userData.profileImage) {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                ...(userData.location && {
                  location_address: userData.location.address,
                  location_lat: userData.location.lat,
                  location_lng: userData.location.lng,
                }),
                ...(userData.profileImage && { profile_image: userData.profileImage }),
                updated_at: new Date().toISOString(),
              })
              .eq('id', data.user.id);

            if (updateError) {
              console.error('Error updating user profile:', updateError);
            }
          }

          // Fetch the complete user profile
          const userProfile = await fetchUserProfile(data.user.id);
          const supabaseUser = createUserFromSupabase(data.user, userProfile);
          setUser(supabaseUser);
        }
      } else {
        // Fall back to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if email already exists
        if (MOCK_USERS.some(u => u.email === userData.email)) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        
        // Generate a new UUID for the user
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        // In a real app, you would send this data to your backend
        // For this mock version, we'll just create a new user object
        const newUser: User = {
          id: generateUUID(),
          name: userData.name || 'User',
          email: userData.email || '',
          role: userData.role || 'recipient',
          ...(userData.location && { location: userData.location }),
          ...(userData.profileImage && { profileImage: userData.profileImage }),
        };
        
        setUser(newUser);
        localStorage.setItem('foodShareUser', JSON.stringify(newUser));
        
        // In a real app, you would add the user to the database
        // MOCK_USERS.push({ ...newUser, password });
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    if (isSupabaseConfigured()) {
      // Use Supabase logout
      await supabase.auth.signOut();
    } else {
      // Fall back to mock logout
      localStorage.removeItem('foodShareUser');
    }
    setUser(null);
  };
  
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConfigured() && user) {
        // Use Supabase to update user profile
        const { error } = await supabase
          .from('users')
          .update({
            name: data.name || user.name,
            role: data.role || user.role,
            ...(data.location && {
              location_address: data.location.address,
              location_lat: data.location.lat,
              location_lng: data.location.lng,
            }),
            ...(data.profileImage && { profile_image: data.profileImage }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      } else {
        // Fall back to mock profile update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!user) {
          throw new Error('Not authenticated');
        }
        
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('foodShareUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};