import * as SQLite from 'expo-sqlite';
import { ServiceRequest, Business, Customer } from '../types';

// Open database
const db = SQLite.openDatabaseSync('squaredeal_v2.db');

// Initialize database schema
export function initDatabase() {
  // Drop existing tables for fresh start (hackathon mode)
  db.execSync(`
    DROP TABLE IF EXISTS service_requests;
    DROP TABLE IF EXISTS businesses;
    DROP TABLE IF EXISTS customers;
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      categories TEXT NOT NULL,
      service_radius_miles INTEGER DEFAULT 25,
      location TEXT NOT NULL,
      accepts_new_requests INTEGER DEFAULT 1,
      total_completed INTEGER DEFAULT 0,
      response_time_avg_minutes INTEGER,
      opening_hours TEXT,
      availability_status TEXT DEFAULT 'available',
      years_in_business INTEGER,
      is_insured INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 0,
      description TEXT,
      website TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      problem_photo_url TEXT NOT NULL,
      ai_description TEXT NOT NULL,
      problem_category TEXT NOT NULL,
      urgency TEXT NOT NULL,
      location TEXT NOT NULL,
      appointment_details TEXT,
      customer_budget REAL,
      suggested_price REAL,
      floor_price REAL,
      matched_business_ids TEXT DEFAULT '[]',
      assigned_business_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      responded_at TEXT,
      scheduled_at TEXT,
      completed_at TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(assigned_business_id) REFERENCES businesses(id)
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_customer ON service_requests(customer_id);
    CREATE INDEX IF NOT EXISTS idx_requests_business ON service_requests(assigned_business_id);
  `);

  console.log('✅ Database initialized');
}

// Seed initial data
export function seedDatabase() {
  const mockBusinesses = [
    {
      id: 'org_shoreditch_plumbing',
      name: 'Shoreditch Plumbing Services',
      email: 'info@shoreditchplumbing.co.uk',
      phone: '+44 20 7123 4567',
      categories: JSON.stringify(['plumbing', 'general_handyman']),
      service_radius_miles: 5,
      location: JSON.stringify({
        address: '15 Old Street',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1V 9HL',
        coordinates: {
          latitude: 51.5254,
          longitude: -0.0877,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 247,
      response_time_avg_minutes: 45,
      opening_hours: JSON.stringify({
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
        sunday: { isOpen: false },
      }),
      availability_status: 'available',
      years_in_business: 12,
      is_insured: 1,
      is_verified: 1,
      description: 'Professional plumbing and general handyman services in East London. Specializing in emergency repairs, installations, and maintenance.',
      website: 'https://shoreditchplumbing.co.uk',
    },
    {
      id: 'org_eastlondon_electrical',
      name: 'East London Electrical Ltd',
      email: 'contact@eastlondonelectrical.com',
      phone: '+44 20 7234 5678',
      categories: JSON.stringify(['electrical', 'appliance_repair']),
      service_radius_miles: 7,
      location: JSON.stringify({
        address: '42 City Road',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1Y 2AP',
        coordinates: {
          latitude: 51.5268,
          longitude: -0.0871,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 189,
      response_time_avg_minutes: 60,
      opening_hours: JSON.stringify({
        monday: { open: '07:30', close: '19:00', isOpen: true },
        tuesday: { open: '07:30', close: '19:00', isOpen: true },
        wednesday: { open: '07:30', close: '19:00', isOpen: true },
        thursday: { open: '07:30', close: '19:00', isOpen: true },
        friday: { open: '07:30', close: '19:00', isOpen: true },
        saturday: { open: '08:00', close: '16:00', isOpen: true },
        sunday: { isOpen: false },
      }),
      availability_status: 'available',
      years_in_business: 8,
      is_insured: 1,
      is_verified: 1,
      description: 'Certified electricians serving East London. From rewiring to appliance repairs, we handle all electrical needs safely and efficiently.',
      website: 'https://eastlondonelectrical.com',
    },
    {
      id: 'org_shoreditch_hvac',
      name: 'Shoreditch HVAC & Heating',
      email: 'hello@shoreditchhvac.co.uk',
      phone: '+44 20 7345 6789',
      categories: JSON.stringify(['hvac']),
      service_radius_miles: 10,
      location: JSON.stringify({
        address: '78 Great Eastern Street',
        city: 'London',
        state: 'Greater London',
        zip: 'EC2A 3JL',
        coordinates: {
          latitude: 51.5244,
          longitude: -0.0811,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 156,
      response_time_avg_minutes: 90,
    },
    {
      id: 'org_tech_city_carpentry',
      name: 'Tech City Carpentry & Joinery',
      email: 'bookings@techcitycarpentry.com',
      phone: '+44 20 7456 7890',
      categories: JSON.stringify(['carpentry']),
      service_radius_miles: 6,
      location: JSON.stringify({
        address: '23 Leonard Street',
        city: 'London',
        state: 'Greater London',
        zip: 'EC2A 4QS',
        coordinates: {
          latitude: 51.5243,
          longitude: -0.0823,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 134,
      response_time_avg_minutes: 120,
    },
    {
      id: 'org_hoxton_handyman',
      name: 'Hoxton Handyman Services',
      email: 'info@hoxtonhandyman.co.uk',
      phone: '+44 20 7567 8901',
      categories: JSON.stringify(['general_handyman', 'painting', 'carpentry']),
      service_radius_miles: 4,
      location: JSON.stringify({
        address: '91 Hoxton Street',
        city: 'London',
        state: 'Greater London',
        zip: 'N1 6QL',
        coordinates: {
          latitude: 51.5312,
          longitude: -0.0765,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 312,
      response_time_avg_minutes: 30,
    },
    {
      id: 'org_clerkenwell_painting',
      name: 'Clerkenwell Painting & Decorating',
      email: 'team@clerkenwellpainting.com',
      phone: '+44 20 7678 9012',
      categories: JSON.stringify(['painting']),
      service_radius_miles: 8,
      location: JSON.stringify({
        address: '56 Clerkenwell Road',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1M 5PX',
        coordinates: {
          latitude: 51.5221,
          longitude: -0.1065,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 98,
      response_time_avg_minutes: 180,
    },
    {
      id: 'org_cityroad_appliances',
      name: 'City Road Appliance Repair',
      email: 'repairs@cityroadappliances.co.uk',
      phone: '+44 20 7789 0123',
      categories: JSON.stringify(['appliance_repair', 'electrical']),
      service_radius_miles: 5,
      location: JSON.stringify({
        address: '134 City Road',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1V 2NJ',
        coordinates: {
          latitude: 51.5283,
          longitude: -0.0889,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 223,
      response_time_avg_minutes: 75,
    },
    {
      id: 'org_oldstreet_247',
      name: 'Old Street 24/7 Emergency Services',
      email: 'emergency@oldstreet247.co.uk',
      phone: '+44 20 7890 1234',
      categories: JSON.stringify(['plumbing', 'electrical', 'general_handyman']),
      service_radius_miles: 12,
      location: JSON.stringify({
        address: '1 Old Street Roundabout',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1V 9AA',
        coordinates: {
          latitude: 51.5254,
          longitude: -0.0877,
        },
      }),
      accepts_new_requests: 1,
      total_completed: 567,
      response_time_avg_minutes: 15,
    },
  ];

  mockBusinesses.forEach((business) => {
    db.runSync(
      `INSERT OR REPLACE INTO businesses (
        id, name, email, phone, categories, service_radius_miles, location,
        accepts_new_requests, total_completed, response_time_avg_minutes,
        opening_hours, availability_status, years_in_business,
        is_insured, is_verified, description, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business.id,
        business.name,
        business.email,
        business.phone,
        business.categories,
        business.service_radius_miles,
        business.location,
        business.accepts_new_requests,
        business.total_completed,
        business.response_time_avg_minutes,
        business.opening_hours,
        business.availability_status,
        business.years_in_business,
        business.is_insured,
        business.is_verified,
        business.description,
        business.website,
      ]
    );
  });

  console.log(`✅ Database seeded with ${mockBusinesses.length} mock businesses around Old Street, London`);

  // Seed mock service requests
  const mockRequests = [
    {
      id: 'req_mock_1',
      customer_id: 'customer_123',
      customer_name: 'Emily Parker',
      customer_phone: '+44 20 7111 2222',
      customer_email: 'emily@example.com',
      problem_photo_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
      ai_description: 'Leaking pipe under kitchen sink causing water damage to cabinet',
      problem_category: 'plumbing',
      urgency: 'high',
      location: JSON.stringify({
        address: '42 Brick Lane',
        city: 'London',
        state: 'Greater London',
        zip: 'E1 6QL',
        coordinates: { latitude: 51.5223, longitude: -0.0712 },
      }),
      customer_budget: 95,
      suggested_price: 90,
      floor_price: 80,
      matched_business_ids: JSON.stringify(['org_shoreditch_plumbing', 'org_oldstreet_247']),
      status: 'pending',
    },
    {
      id: 'req_mock_2',
      customer_id: 'customer_456',
      customer_name: 'David Chen',
      customer_phone: '+44 20 7333 4444',
      customer_email: 'david@example.com',
      problem_photo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
      ai_description: 'Faulty electrical outlet in bedroom - sparking when plugged in',
      problem_category: 'electrical',
      urgency: 'high',
      location: JSON.stringify({
        address: '15 Shoreditch High Street',
        city: 'London',
        state: 'Greater London',
        zip: 'E1 6JE',
        coordinates: { latitude: 51.5246, longitude: -0.0774 },
      }),
      customer_budget: 120,
      suggested_price: 110,
      floor_price: 85,
      matched_business_ids: JSON.stringify(['org_eastlondon_electrical', 'org_oldstreet_247']),
      status: 'pending',
    },
    {
      id: 'req_mock_3',
      customer_id: 'customer_789',
      customer_name: 'Sophie Anderson',
      customer_phone: '+44 20 7555 6666',
      customer_email: 'sophie@example.com',
      problem_photo_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800',
      ai_description: 'Need help assembling IKEA furniture and mounting TV on wall',
      problem_category: 'general_handyman',
      urgency: 'low',
      location: JSON.stringify({
        address: '78 Old Street',
        city: 'London',
        state: 'Greater London',
        zip: 'EC1V 9LT',
        coordinates: { latitude: 51.5254, longitude: -0.0877 },
      }),
      customer_budget: 70,
      suggested_price: 65,
      floor_price: 55,
      matched_business_ids: JSON.stringify(['org_hoxton_handyman', 'org_oldstreet_247']),
      status: 'pending',
    },
  ];

  mockRequests.forEach((req) => {
    db.runSync(
      `INSERT OR REPLACE INTO service_requests (
        id, customer_id, customer_name, customer_phone, customer_email,
        problem_photo_url, ai_description, problem_category, urgency,
        location, customer_budget, suggested_price, floor_price,
        matched_business_ids, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.id,
        req.customer_id,
        req.customer_name,
        req.customer_phone,
        req.customer_email,
        req.problem_photo_url,
        req.ai_description,
        req.problem_category,
        req.urgency,
        req.location,
        req.customer_budget,
        req.suggested_price,
        req.floor_price,
        req.matched_business_ids,
        req.status,
      ]
    );
  });

  console.log(`✅ Database seeded with ${mockRequests.length} mock service requests`);
}

// Service Requests
export async function createServiceRequest(
  request: Omit<ServiceRequest, 'id' | 'created_at'>
): Promise<ServiceRequest> {
  const id = `req_${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO service_requests (
      id, customer_id, customer_name, customer_phone, customer_email,
      problem_photo_url, ai_description, problem_category, urgency,
      location, appointment_details, matched_business_ids, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      request.customer_id,
      request.customer_name,
      request.customer_phone,
      request.customer_email,
      request.problem_photo_url,
      request.ai_description,
      request.problem_category,
      request.urgency,
      JSON.stringify(request.location),
      request.appointment_details ? JSON.stringify(request.appointment_details) : null,
      JSON.stringify(request.matched_business_ids || []),
      request.status || 'pending',
    ]
  );

  return {
    ...request,
    id,
    created_at: createdAt,
  };
}

export function getServiceRequests(filters?: {
  status?: string;
  customerId?: string;
  businessId?: string;
}): ServiceRequest[] {
  let query = 'SELECT * FROM service_requests WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.customerId) {
    query += ' AND customer_id = ?';
    params.push(filters.customerId);
  }

  if (filters?.businessId) {
    query += ` AND (assigned_business_id = ? OR matched_business_ids LIKE '%' || ? || '%')`;
    params.push(filters.businessId, filters.businessId);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.getAllSync(query, params) as any[];

  return rows.map((row) => ({
    ...row,
    location: JSON.parse(row.location),
    appointment_details: row.appointment_details
      ? JSON.parse(row.appointment_details)
      : null,
    matched_business_ids: JSON.parse(row.matched_business_ids || '[]'),
  }));
}

export function getServiceRequestById(id: string): ServiceRequest | null {
  const row = db.getFirstSync(
    'SELECT * FROM service_requests WHERE id = ?',
    [id]
  ) as any;

  if (!row) return null;

  return {
    ...row,
    location: JSON.parse(row.location),
    appointment_details: row.appointment_details
      ? JSON.parse(row.appointment_details)
      : null,
    matched_business_ids: JSON.parse(row.matched_business_ids || '[]'),
  };
}

export function updateServiceRequest(
  id: string,
  updates: Partial<ServiceRequest>
): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (updates.assigned_business_id) {
    fields.push('assigned_business_id = ?');
    values.push(updates.assigned_business_id);
  }

  if (updates.responded_at) {
    fields.push('responded_at = ?');
    values.push(updates.responded_at);
  }

  if (updates.matched_business_ids) {
    fields.push('matched_business_ids = ?');
    values.push(JSON.stringify(updates.matched_business_ids));
  }

  if (fields.length === 0) return;

  values.push(id);

  db.runSync(
    `UPDATE service_requests SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

// Businesses
export function getBusinesses(filters?: {
  categories?: string[];
}): Business[] {
  let query = 'SELECT * FROM businesses WHERE accepts_new_requests = 1';

  const rows = db.getAllSync(query) as any[];

  return rows
    .map((row) => {
      let openingHours = null;
      if (row.opening_hours) {
        const parsed = JSON.parse(row.opening_hours);
        // Ensure all isOpen values are actual booleans
        openingHours = {};
        for (const day in parsed) {
          openingHours[day] = {
            ...parsed[day],
            isOpen: Boolean(parsed[day].isOpen),
          };
        }
      }

      return {
        ...row,
        categories: JSON.parse(row.categories),
        location: JSON.parse(row.location),
        opening_hours: openingHours,
        accepts_new_requests: Boolean(row.accepts_new_requests),
        is_insured: Boolean(row.is_insured),
        is_verified: Boolean(row.is_verified),
      };
    })
    .filter((business) => {
      if (!filters?.categories || filters.categories.length === 0) return true;
      return filters.categories.some((cat) => business.categories.includes(cat));
    });
}

export function getBusinessById(id: string): Business | null {
  const row = db.getFirstSync('SELECT * FROM businesses WHERE id = ?', [
    id,
  ]) as any;

  if (!row) return null;

  let openingHours = null;
  if (row.opening_hours) {
    const parsed = JSON.parse(row.opening_hours);
    // Ensure all isOpen values are actual booleans
    openingHours = {};
    for (const day in parsed) {
      openingHours[day] = {
        ...parsed[day],
        isOpen: Boolean(parsed[day].isOpen),
      };
    }
  }

  return {
    ...row,
    categories: JSON.parse(row.categories),
    location: JSON.parse(row.location),
    opening_hours: openingHours,
    accepts_new_requests: Boolean(row.accepts_new_requests),
    is_insured: Boolean(row.is_insured),
    is_verified: Boolean(row.is_verified),
  };
}

// Initialize on import
initDatabase();
seedDatabase();
