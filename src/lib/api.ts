import { supabase } from './supabase';
import type { Database } from './database.types';

type Donation = Database['public']['Tables']['donations']['Row'];
type DonationImage = Database['public']['Tables']['donation_images']['Row'];

export interface DonationWithImages extends Donation {
  images: DonationImage[];
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

// Mock donations for demonstration when Supabase is not connected
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
    images: [
      {
        id: '6',
        donation_id: '6',
        url: 'https://images.pexels.com/photos/6994982/pexels-photo-6994982.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: '2024-12-18T18:00:00Z'
      }
    ]
  }
];

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

export async function createDonation(data: DonationFormData, userId: string): Promise<DonationWithImages> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    
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
      donor_id: userId,
      recipient_id: null,
      rider_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    
    // Add to mock data
    mockDonations.unshift(newDonation);
    return newDonation;
  }

  try {
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
          donor_id: userId,
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

    return {
      ...donation,
      images,
    };
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
}

export async function getDonations(): Promise<DonationWithImages[]> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    return mockDonations;
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
    return mockDonations;
  }
}

export async function getDonationById(id: string): Promise<DonationWithImages | null> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    const mockDonation = mockDonations.find(d => d.id === id);
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
    const mockDonation = mockDonations.find(d => d.id === id);
    return mockDonation || null;
  }
}

export async function updateDonationStatus(
  id: string,
  status: string,
  userId: string
): Promise<void> {
  // Check if Supabase is configured before attempting any operations
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    // Update mock data
    const donationIndex = mockDonations.findIndex(d => d.id === id);
    if (donationIndex !== -1) {
      mockDonations[donationIndex] = {
        ...mockDonations[donationIndex],
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'claimed' && { recipient_id: userId }),
        ...(status === 'in_transit' && { rider_id: userId }),
      };
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
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw error;
  }
}