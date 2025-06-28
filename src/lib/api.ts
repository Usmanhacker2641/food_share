import { supabase } from './supabase';
import type { Database } from './database.types';

type Donation = Database['public']['Tables']['donations']['Row'];
type DonationImage = Database['public']['Tables']['donation_images']['Row'];

export interface DonationWithImages extends Donation {
  images: DonationImage[];
  donor_name?: string;
  recipient_name?: string;
  rider_name?: string;
}

export interface DonationFormData {
  title: string;
  description: string;
  quantity: string;
  expiry_date: string;
  pickup_address: string;
  pickup_instructions?: string;
  images?: FileList;
}

// Enhanced mock donations with more variety for demonstration
const mockDonations: DonationWithImages[] = [
  {
    id: '1',
    title: 'Fresh Vegetables from Local Market',
    description: 'Assorted fresh vegetables including carrots, lettuce, tomatoes, and bell peppers. All items are in excellent condition and perfect for healthy meals.',
    quantity: '5 kg',
    expiry_date: '2024-12-25T00:00:00Z',
    pickup_address: '123 Market Street, New York, NY 10001',
    pickup_instructions: 'Ring doorbell, items are in refrigerated storage',
    status: 'available',
    donor_id: '1',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T10:00:00Z',
    updated_at: '2024-12-18T10:00:00Z',
    donor_name: 'John Donor',
    images: [
      {
        id: '1',
        donation_id: '1',
        url: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Bakery Items - End of Day',
    description: 'Fresh bread, pastries, croissants, and baked goods from our bakery. Perfect for community meals and families in need.',
    quantity: '20 items',
    expiry_date: '2024-12-20T00:00:00Z',
    pickup_address: '456 Bakery Lane, Brooklyn, NY 11201',
    pickup_instructions: 'Use side entrance, ask for manager',
    status: 'available',
    donor_id: '2',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T08:00:00Z',
    updated_at: '2024-12-18T08:00:00Z',
    donor_name: 'Sarah\'s Bakery',
    images: [
      {
        id: '2',
        donation_id: '2',
        url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T08:00:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Restaurant Surplus - Prepared Meals',
    description: 'Freshly prepared meals including pasta, salads, and sandwiches. All items prepared today with high-quality ingredients.',
    quantity: '15 servings',
    expiry_date: '2024-12-19T00:00:00Z',
    pickup_address: '789 Restaurant Row, Manhattan, NY 10019',
    pickup_instructions: 'Call upon arrival, meals are packaged and ready',
    status: 'available',
    donor_id: '3',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T12:00:00Z',
    updated_at: '2024-12-18T12:00:00Z',
    donor_name: 'Bella Vista Restaurant',
    images: [
      {
        id: '3',
        donation_id: '3',
        url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T12:00:00Z'
      }
    ]
  },
  {
    id: '4',
    title: 'Fresh Fruits Collection',
    description: 'Seasonal fresh fruits including apples, oranges, bananas, and berries. Great source of vitamins and perfect for healthy snacks.',
    quantity: '8 kg',
    expiry_date: '2024-12-22T00:00:00Z',
    pickup_address: '321 Orchard Street, Queens, NY 11375',
    pickup_instructions: 'Available after 2 PM, please bring bags',
    status: 'available',
    donor_id: '4',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T14:00:00Z',
    updated_at: '2024-12-18T14:00:00Z',
    donor_name: 'Green Valley Farm',
    images: [
      {
        id: '4',
        donation_id: '4',
        url: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T14:00:00Z'
      }
    ]
  },
  {
    id: '5',
    title: 'Dairy Products - Milk & Cheese',
    description: 'Fresh dairy products including milk, cheese, yogurt, and butter. All items are refrigerated and within expiration dates.',
    quantity: '12 items',
    expiry_date: '2024-12-21T00:00:00Z',
    pickup_address: '654 Dairy Farm Road, Staten Island, NY 10301',
    pickup_instructions: 'Refrigerated pickup required, bring cooler',
    status: 'available',
    donor_id: '5',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T16:00:00Z',
    updated_at: '2024-12-18T16:00:00Z',
    donor_name: 'Sunshine Dairy',
    images: [
      {
        id: '5',
        donation_id: '5',
        url: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T16:00:00Z'
      }
    ]
  },
  {
    id: '6',
    title: 'Canned Goods & Non-Perishables',
    description: 'Variety of canned goods including beans, corn, soup, pasta sauce, and rice. Long shelf life and perfect for food banks.',
    quantity: '30 items',
    expiry_date: '2025-06-15T00:00:00Z',
    pickup_address: '987 Community Center Ave, Bronx, NY 10451',
    pickup_instructions: 'Available weekdays 9 AM - 5 PM',
    status: 'available',
    donor_id: '6',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T18:00:00Z',
    updated_at: '2024-12-18T18:00:00Z',
    donor_name: 'Community Food Hub',
    images: [
      {
        id: '6',
        donation_id: '6',
        url: 'https://images.pexels.com/photos/6994982/pexels-photo-6994982.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T18:00:00Z'
      }
    ]
  },
  {
    id: '7',
    title: 'Organic Produce Box',
    description: 'Mixed organic vegetables and fruits from local farm. Includes seasonal produce that\'s perfect for families.',
    quantity: '10 kg',
    expiry_date: '2024-12-23T00:00:00Z',
    pickup_address: '555 Farm Road, Long Island, NY 11701',
    pickup_instructions: 'Farm stand pickup, look for the red barn',
    status: 'available',
    donor_id: '7',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T20:00:00Z',
    updated_at: '2024-12-18T20:00:00Z',
    donor_name: 'Organic Harvest Farm',
    images: [
      {
        id: '7',
        donation_id: '7',
        url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T20:00:00Z'
      }
    ]
  },
  {
    id: '8',
    title: 'Grocery Store Surplus',
    description: 'Mixed grocery items including packaged foods, snacks, and beverages. All items are within expiration dates.',
    quantity: '25 items',
    expiry_date: '2024-12-24T00:00:00Z',
    pickup_address: '888 Main Street, Manhattan, NY 10001',
    pickup_instructions: 'Customer service desk pickup',
    status: 'available',
    donor_id: '8',
    recipient_id: null,
    rider_id: null,
    created_at: '2024-12-18T22:00:00Z',
    updated_at: '2024-12-18T22:00:00Z',
    donor_name: 'FreshMart Grocery',
    images: [
      {
        id: '8',
        donation_id: '8',
        url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T22:00:00Z'
      }
    ]
  }
];

// Global storage for donations (simulates database persistence)
let globalDonations = [...mockDonations];

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

// Helper function to convert FileList to base64 URLs for mock storage
const convertFilesToBase64 = async (files: FileList): Promise<string[]> => {
  const promises = Array.from(files).map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  
  return Promise.all(promises);
};

// Enhanced function to create donation with real-time updates
export async function createDonation(data: DonationFormData): Promise<DonationWithImages> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using enhanced mock data with persistence');
    
    // Convert uploaded images to base64 for mock storage
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      try {
        imageUrls = await convertFilesToBase64(data.images);
      } catch (error) {
        console.error('Error converting images to base64:', error);
      }
    }
    
    const newDonation: DonationWithImages = {
      id: Math.random().toString(36).substring(2, 9),
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      expiry_date: data.expiry_date,
      pickup_address: data.pickup_address,
      pickup_instructions: data.pickup_instructions || null,
      status: 'available',
      donor_id: 'mock-user-id',
      recipient_id: null,
      rider_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      donor_name: 'Current User', // In real app, this would be fetched from user data
      images: imageUrls.map((url, index) => ({
        id: `${Math.random().toString(36).substring(2, 9)}-${index}`,
        donation_id: '',
        url: url,
        created_at: new Date().toISOString()
      }))
    };
    
    // Update the donation_id in images
    newDonation.images.forEach(img => {
      img.donation_id = newDonation.id;
    });
    
    // Add to global storage (simulates database persistence across all users)
    globalDonations.unshift(newDonation);
    
    // Trigger real-time update event (simulates real-time database updates)
    window.dispatchEvent(new CustomEvent('donationCreated', { 
      detail: newDonation 
    }));
    
    return newDonation;
  }

  try {
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Use Supabase if configured
    const { data: donation, error } = await supabase
      .from('donations')
      .insert([
        {
          title: data.title,
          description: data.description,
          quantity: data.quantity,
          expiry_date: data.expiry_date,
          pickup_address: data.pickup_address,
          pickup_instructions: data.pickup_instructions,
          donor_id: user.id, // Use the authenticated user's ID
          status: 'available',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    let images: DonationImage[] = [];

    if (data.images && data.images.length > 0) {
      const imageUrls = await Promise.all(
        Array.from(data.images).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `donations/${donation.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('donations')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('donations')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      const { data: insertedImages, error: imageError } = await supabase
        .from('donation_images')
        .insert(
          imageUrls.map(url => ({
            donation_id: donation.id,
            url,
          }))
        )
        .select();

      if (imageError) throw imageError;
      images = insertedImages || [];
    }

    const donationWithImages = {
      ...donation,
      images,
    };

    // Trigger real-time update for Supabase users
    window.dispatchEvent(new CustomEvent('donationCreated', { 
      detail: donationWithImages 
    }));

    return donationWithImages;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
}

// Enhanced function to get all donations with real-time capabilities
export async function getDonations(): Promise<DonationWithImages[]> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using enhanced mock data');
    // Return only available donations, sorted by creation date (newest first)
    return globalDonations
      .filter(donation => donation.status === 'available')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        images:donation_images(*)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching donations:', error);
    // Return mock data as fallback for any error (including network errors)
    return globalDonations
      .filter(donation => donation.status === 'available')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// Enhanced function to get donation by ID
export async function getDonationById(id: string): Promise<DonationWithImages | null> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using enhanced mock data');
    const mockDonation = globalDonations.find(d => d.id === id);
    return mockDonation || null;
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        images:donation_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching donation:', error);
    // Return mock data as fallback
    const mockDonation = globalDonations.find(d => d.id === id);
    return mockDonation || null;
  }
}

// Enhanced function to update donation status with real-time updates
export async function updateDonationStatus(
  id: string,
  status: string,
  userId: string
): Promise<void> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using enhanced mock data');
    // Update mock data
    const donationIndex = globalDonations.findIndex(d => d.id === id);
    if (donationIndex !== -1) {
      const updatedDonation = {
        ...globalDonations[donationIndex],
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'claimed' && { recipient_id: userId }),
        ...(status === 'in_transit' && { rider_id: userId }),
      };
      
      globalDonations[donationIndex] = updatedDonation;
      
      // Trigger real-time update event
      window.dispatchEvent(new CustomEvent('donationUpdated', { 
        detail: { id, status, userId } 
      }));
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('donations')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'claimed' && { recipient_id: userId }),
        ...(status === 'in_transit' && { rider_id: userId }),
      })
      .eq('id', id);

    if (error) throw error;
    
    // Trigger real-time update event
    window.dispatchEvent(new CustomEvent('donationUpdated', { 
      detail: { id, status, userId } 
    }));
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw error;
  }
}

// Function to get user's own donations
export async function getUserDonations(userId: string): Promise<DonationWithImages[]> {
  if (!isSupabaseConfigured()) {
    return globalDonations.filter(d => d.donor_id === userId);
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        images:donation_images(*)
      `)
      .eq('donor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user donations:', error);
    return globalDonations.filter(d => d.donor_id === userId);
  }
}

// Function to get user's requested donations
export async function getUserRequests(userId: string): Promise<DonationWithImages[]> {
  if (!isSupabaseConfigured()) {
    return globalDonations.filter(d => d.recipient_id === userId);
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        images:donation_images(*)
      `)
      .eq('recipient_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return globalDonations.filter(d => d.recipient_id === userId);
  }
}

// Function to subscribe to real-time donation updates
export function subscribeToDonationUpdates(callback: (donations: DonationWithImages[]) => void) {
  const handleDonationCreated = async () => {
    const donations = await getDonations();
    callback(donations);
  };

  const handleDonationUpdated = async () => {
    const donations = await getDonations();
    callback(donations);
  };

  // Listen for custom events (for mock data)
  window.addEventListener('donationCreated', handleDonationCreated);
  window.addEventListener('donationUpdated', handleDonationUpdated);

  // If Supabase is configured, also listen to real-time updates
  if (isSupabaseConfigured()) {
    const channel = supabase
      .channel('donations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'donations' }, 
        handleDonationCreated
      )
      .subscribe();

    return () => {
      window.removeEventListener('donationCreated', handleDonationCreated);
      window.removeEventListener('donationUpdated', handleDonationUpdated);
      supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener('donationCreated', handleDonationCreated);
    window.removeEventListener('donationUpdated', handleDonationUpdated);
  };
}