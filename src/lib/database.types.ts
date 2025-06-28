export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          role: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          title: string
          description: string
          quantity: string
          expiry_date: string
          pickup_address: string
          pickup_instructions: string | null
          status: string
          donor_id: string
          recipient_id: string | null
          rider_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          quantity: string
          expiry_date: string
          pickup_address: string
          pickup_instructions?: string | null
          status?: string
          donor_id: string
          recipient_id?: string | null
          rider_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          quantity?: string
          expiry_date?: string
          pickup_address?: string
          pickup_instructions?: string | null
          status?: string
          donor_id?: string
          recipient_id?: string | null
          rider_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donation_images: {
        Row: {
          id: string
          donation_id: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          url?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}