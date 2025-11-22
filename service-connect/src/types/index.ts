// Core data types for the application

export type UserType = 'customer' | 'business';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export type ProblemCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'carpentry'
  | 'painting'
  | 'landscaping'
  | 'appliance_repair'
  | 'general_handyman'
  | 'other';

export interface ServiceRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;

  // Problem details
  problem_photo_url: string;
  ai_description: string;
  problem_category: ProblemCategory;
  urgency: 'low' | 'medium' | 'high';

  // Location
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Appointment preferences (from chat)
  appointment_details?: {
    preferred_date?: string;
    preferred_time?: string;
    additional_notes?: string;
  };

  // Pricing
  customer_budget?: number; // How much customer is willing to pay
  suggested_price?: number; // AI-suggested price based on job
  floor_price?: number; // Minimum acceptable price for this category

  // Business matching
  matched_business_ids: string[];
  assigned_business_id?: string;
  status: RequestStatus;
  distance_miles?: number; // Distance from business location

  // Timestamps
  created_at: string;
  responded_at?: string;
  scheduled_at?: string;
  completed_at?: string;
}

export interface Business {
  id: string; // Clerk organization ID
  name: string;
  email: string;
  phone: string;

  // Service details
  categories: ProblemCategory[];
  service_radius_miles: number;

  // Location
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  // Availability
  accepts_new_requests: boolean;

  // Stats
  total_completed: number;
  response_time_avg_minutes?: number;

  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string; // Clerk user ID
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  request_id: string;
  customer_name: string;
  customer_phone: string;
  service_type: ProblemCategory;
  date: string; // ISO date string
  time_start: string; // "09:00"
  time_end: string; // "11:00"
  location: {
    address: string;
    city: string;
  };
  price: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  notes?: string;
}

// Floor prices for different service categories (in GBP)
export const FLOOR_PRICES: Record<ProblemCategory, number> = {
  plumbing: 80,
  electrical: 85,
  hvac: 90,
  carpentry: 75,
  painting: 60,
  landscaping: 70,
  appliance_repair: 65,
  general_handyman: 55,
  other: 50,
};
