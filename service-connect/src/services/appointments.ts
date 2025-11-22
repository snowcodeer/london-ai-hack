import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '../types';

const APPOINTMENTS_KEY = '@appointments';

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
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
