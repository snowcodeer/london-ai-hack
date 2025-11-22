import { createClient } from '@supabase/supabase-js';
import { ServiceRequest, Business, Customer } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      service_requests: {
        Row: ServiceRequest;
        Insert: Omit<ServiceRequest, 'id' | 'created_at'>;
        Update: Partial<ServiceRequest>;
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'created_at' | 'updated_at'>;
        Update: Partial<Business>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'created_at'>;
        Update: Partial<Customer>;
      };
    };
  };
}
