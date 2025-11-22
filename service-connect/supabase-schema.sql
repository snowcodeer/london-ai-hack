-- Service Connect Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geolocation (optional but recommended for distance calculations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id TEXT PRIMARY KEY, -- Clerk user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE businesses (
  id TEXT PRIMARY KEY, -- Clerk organization ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Service details
  categories TEXT[] NOT NULL DEFAULT '{}',
  service_radius_miles INTEGER DEFAULT 25,

  -- Location
  location JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Geolocation point for distance queries (if using PostGIS)
  coordinates GEOGRAPHY(POINT, 4326),

  -- Availability
  accepts_new_requests BOOLEAN DEFAULT true,

  -- Stats
  total_completed INTEGER DEFAULT 0,
  response_time_avg_minutes INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on location for faster proximity searches
CREATE INDEX idx_businesses_coordinates ON businesses USING GIST(coordinates);

-- ============================================
-- SERVICE REQUESTS TABLE
-- ============================================
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer info
  customer_id TEXT NOT NULL REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- Problem details
  problem_photo_url TEXT NOT NULL,
  ai_description TEXT NOT NULL,
  problem_category TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),

  -- Location
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  coordinates GEOGRAPHY(POINT, 4326),

  -- Appointment preferences (from chat)
  appointment_details JSONB DEFAULT NULL,

  -- Business matching
  matched_business_ids TEXT[] DEFAULT '{}',
  assigned_business_id TEXT REFERENCES businesses(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_business ON service_requests(assigned_business_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_matched ON service_requests USING GIN(matched_business_ids);
CREATE INDEX idx_service_requests_created ON service_requests(created_at DESC);
CREATE INDEX idx_service_requests_coordinates ON service_requests USING GIST(coordinates);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for problem photos
-- Run this in Supabase dashboard or via SQL:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('problem-photos', 'problem-photos', true);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Customers can read and update their own data
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Customers can insert own data"
  ON customers FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- Businesses can read and update their own data
CREATE POLICY "Businesses can view own data"
  ON businesses FOR SELECT
  USING (id = ANY(SELECT id FROM organizations WHERE user_id = auth.uid()::text));

CREATE POLICY "Businesses can update own data"
  ON businesses FOR UPDATE
  USING (id = ANY(SELECT id FROM organizations WHERE user_id = auth.uid()::text));

-- Service requests policies
CREATE POLICY "Customers can view their own requests"
  ON service_requests FOR SELECT
  USING (customer_id = auth.uid()::text);

CREATE POLICY "Customers can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid()::text);

CREATE POLICY "Businesses can view matched requests"
  ON service_requests FOR SELECT
  USING (
    assigned_business_id = ANY(SELECT id FROM organizations WHERE user_id = auth.uid()::text)
    OR matched_business_ids && ARRAY(SELECT id FROM organizations WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Businesses can update assigned requests"
  ON service_requests FOR UPDATE
  USING (
    assigned_business_id = ANY(SELECT id FROM organizations WHERE user_id = auth.uid()::text)
    OR matched_business_ids && ARRAY(SELECT id FROM organizations WHERE user_id = auth.uid()::text)
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate distance between two points (requires PostGIS)
CREATE OR REPLACE FUNCTION calculate_distance_miles(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lon1, lat1)::geography,
    ST_MakePoint(lon2, lat2)::geography
  ) * 0.000621371; -- Convert meters to miles
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find businesses within radius
CREATE OR REPLACE FUNCTION find_businesses_in_radius(
  request_lat DOUBLE PRECISION,
  request_lon DOUBLE PRECISION,
  category TEXT,
  radius_miles INTEGER DEFAULT 25
)
RETURNS TABLE (
  business_id TEXT,
  business_name TEXT,
  distance_miles DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    ST_Distance(
      b.coordinates,
      ST_MakePoint(request_lon, request_lat)::geography
    ) * 0.000621371 AS distance
  FROM businesses b
  WHERE
    b.accepts_new_requests = true
    AND category = ANY(b.categories)
    AND ST_DWithin(
      b.coordinates,
      ST_MakePoint(request_lon, request_lat)::geography,
      radius_miles * 1609.34 -- Convert miles to meters
    )
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for service_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp on businesses
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
