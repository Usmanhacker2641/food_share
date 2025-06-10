export interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiry_date: string;
  pickup_address: string;
  pickup_instructions?: string;
  status: 'available' | 'claimed' | 'in_transit' | 'delivered' | 'cancelled';
  donor_id: string;
  recipient_id?: string;
  rider_id?: string;
  created_at: string;
  updated_at: string;
  images?: DonationImage[];
}

export interface DonationImage {
  id: string;
  donation_id: string;
  url: string;
  created_at: string;
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

export interface Message {
  id: string;
  pickup_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'recipient' | 'rider' | 'admin';
  location?: Location;
  profileImage?: string;
}

export interface Pickup {
  id: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  donor: {
    id: string;
    name: string;
    address: string;
    location: Location;
  };
  recipient: {
    id: string;
    name: string;
    address: string;
    location: Location;
  };
  food: {
    description: string;
    quantity: string;
    expiryDate: string;
  };
  assignedAt?: string;
  completedAt?: string;
}