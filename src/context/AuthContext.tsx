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
  
  useEffect(() => {
    const initializeAuth = async () => {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
          } else if (session?.user) {
            // Create user object from Supabase session
            const supabaseUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'recipient',
              ...(session.user.user_metadata?.location && { location: session.user.user_metadata.location }),
              ...(session.user.user_metadata?.profileImage && { profileImage: session.user.user_metadata.profileImage }),
            };
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
            const supabaseUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'recipient',
              ...(session.user.user_metadata?.location && { location: session.user.user_metadata.location }),
              ...(session.user.user_metadata?.profileImage && { profileImage: session.user.user_metadata.profileImage }),
            };
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

        if (error) throw error;

        if (data.user) {
          const supabaseUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: (data.user.user_metadata?.role as UserRole) || 'recipient',
            ...(data.user.user_metadata?.location && { location: data.user.user_metadata.location }),
            ...(data.user.user_metadata?.profileImage && { profileImage: data.user.user_metadata.profileImage }),
          };
          setUser(supabaseUser);
        }
      } else {
        // Fall back to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (!foundUser) {
          throw new Error('Invalid credentials');
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
              ...(userData.location && { location: userData.location }),
              ...(userData.profileImage && { profileImage: userData.profileImage }),
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          const supabaseUser: User = {
            id: data.user.id,
            name: userData.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: userData.role || 'recipient',
            ...(userData.location && { location: userData.location }),
            ...(userData.profileImage && { profileImage: userData.profileImage }),
          };
          setUser(supabaseUser);
        }
      } else {
        // Fall back to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if email already exists
        if (MOCK_USERS.some(u => u.email === userData.email)) {
          throw new Error('Email already in use');
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
      if (isSupabaseConfigured()) {
        // Use Supabase to update user metadata
        const { error } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            role: data.role,
            ...(data.location && { location: data.location }),
            ...(data.profileImage && { profileImage: data.profileImage }),
          }
        });

        if (error) throw error;

        if (user) {
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
        }
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