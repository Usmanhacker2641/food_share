import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for saved user in localStorage (simulating persistent sessions)
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
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password before storing user data
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('foodShareUser', JSON.stringify(userWithoutPassword));
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
      // Simulate API request delay
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
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodShareUser');
  };
  
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('foodShareUser', JSON.stringify(updatedUser));
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