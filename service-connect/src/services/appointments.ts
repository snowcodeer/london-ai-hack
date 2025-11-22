import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '../types';

const APPOINTMENTS_KEY = '@appointments';

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }

    // Initialize with fake appointments if none exist
    const fakeAppointments = await initializeFakeAppointments();
    return fakeAppointments;
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
}

async function initializeFakeAppointments(): Promise<Appointment[]> {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayString = today.toISOString().split('T')[0];
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  const fakeAppointments: Appointment[] = [
    {
      id: 'apt_fake_1',
      request_id: 'req_fake_1',
      customer_name: 'Sarah Johnson',
      customer_phone: '+44 7700 900123',
      service_type: 'plumbing',
      date: todayString,
      time_start: '14:00',
      time_end: '16:00',
      location: {
        address: '45 Brick Lane',
        city: 'London',
      },
      price: 120,
      status: 'upcoming',
      notes: 'Leaking kitchen sink, needs urgent repair',
      problem_photo_url: undefined,
    },
    {
      id: 'apt_fake_2',
      request_id: 'req_fake_2',
      customer_name: 'James Mitchell',
      customer_phone: '+44 7700 900456',
      service_type: 'electrical',
      date: tomorrowString,
      time_start: '10:00',
      time_end: '12:00',
      location: {
        address: '22 Shoreditch High Street',
        city: 'London',
      },
      price: 85,
      status: 'upcoming',
      notes: 'Install new light fixtures in living room',
      problem_photo_url: undefined,
    },
  ];

  await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(fakeAppointments));
  return fakeAppointments;
}

export async function addAppointment(appointment: Appointment): Promise<void> {
  try {
    const appointments = await getAppointments();
    appointments.push(appointment);
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Error saving appointment:', error);
  }
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<void> {
  try {
    const appointments = await getAppointments();
    const index = appointments.findIndex((apt) => apt.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
  }
}

export function createAppointmentFromRequest(
  request: any,
  businessId: string
): Appointment {
  // Schedule for tomorrow at 10am by default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];

  return {
    id: `apt_${Date.now()}`,
    request_id: request.id,
    customer_name: request.customer_name,
    customer_phone: request.customer_phone,
    service_type: request.problem_category,
    date: dateString,
    time_start: '10:00',
    time_end: '12:00',
    location: {
      address: request.location.address,
      city: request.location.city,
    },
    price: request.customer_budget || request.suggested_price || 0,
    status: 'upcoming',
    notes: request.ai_description,
    problem_photo_url: request.problem_photo_url,
  };
}
