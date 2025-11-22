import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '../../types';

// Mock appointment data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    request_id: 'req_123',
    customer_name: 'Sarah Johnson',
    customer_phone: '+44 20 7123 4567',
    service_type: 'plumbing',
    date: new Date().toISOString().split('T')[0], // Today
    time_start: '09:00',
    time_end: '11:00',
    location: {
      address: '42 Brick Lane',
      city: 'London',
    },
    price: 95,
    status: 'upcoming',
    notes: 'Leaking pipe under kitchen sink',
  },
  {
    id: 'apt_2',
    request_id: 'req_124',
    customer_name: 'Michael Chen',
    customer_phone: '+44 20 7234 5678',
    service_type: 'electrical',
    date: new Date().toISOString().split('T')[0], // Today
    time_start: '14:00',
    time_end: '16:00',
    location: {
      address: '15 Shoreditch High Street',
      city: 'London',
    },
    price: 120,
    status: 'upcoming',
    notes: 'Install new light fixtures in living room',
  },
  {
    id: 'apt_3',
    request_id: 'req_125',
    customer_name: 'Emma Williams',
    customer_phone: '+44 20 7345 6789',
    service_type: 'general_handyman',
    date: getTomorrow(),
    time_start: '10:00',
    time_end: '12:00',
    location: {
      address: '78 Old Street',
      city: 'London',
    },
    price: 85,
    status: 'upcoming',
    notes: 'Assemble furniture and hang pictures',
  },
  {
    id: 'apt_4',
    request_id: 'req_126',
    customer_name: 'James Brown',
    customer_phone: '+44 20 7456 7890',
    service_type: 'plumbing',
    date: getTomorrow(),
    time_start: '15:00',
    time_end: '17:00',
    location: {
      address: '23 Hoxton Square',
      city: 'London',
    },
    price: 110,
    status: 'upcoming',
  },
  {
    id: 'apt_5',
    request_id: 'req_127',
    customer_name: 'Lisa Anderson',
    customer_phone: '+44 20 7567 8901',
    service_type: 'electrical',
    date: getDateOffset(2),
    time_start: '09:00',
    time_end: '11:00',
    location: {
      address: '91 Great Eastern Street',
      city: 'London',
    },
    price: 95,
    status: 'upcoming',
    notes: 'Fix faulty outlets in bedroom',
  },
];

function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

function getServiceIcon(serviceType: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    plumbing: 'water',
    electrical: 'flash',
    hvac: 'snow',
    carpentry: 'hammer',
    painting: 'color-palette',
    general_handyman: 'construct',
    appliance_repair: 'build',
  };
  return icons[serviceType] || 'construct';
}

export default function ScheduleScreen() {
  const groupedAppointments = MOCK_APPOINTMENTS.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  const totalRevenue = MOCK_APPOINTMENTS.reduce((sum, apt) => sum + apt.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="calendar" size={16} color="#007AFF" />
            <Text style={styles.statText}>{MOCK_APPOINTMENTS.length} jobs</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="cash" size={16} color="#34C759" />
            <Text style={styles.statText}>£{totalRevenue}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {sortedDates.map((date) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            {groupedAppointments[date].map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                activeOpacity={0.7}
              >
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{appointment.time_start}</Text>
                  <View style={styles.timeDivider} />
                  <Text style={styles.timeTextSmall}>{appointment.time_end}</Text>
                </View>

                <View style={styles.detailsColumn}>
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceIconContainer}>
                      <Ionicons
                        name={getServiceIcon(appointment.service_type)}
                        size={18}
                        color="#007AFF"
                      />
                    </View>
                    <Text style={styles.serviceTypeText}>
                      {appointment.service_type.replace('_', ' ')}
                    </Text>
                  </View>

                  <Text style={styles.customerName}>{appointment.customer_name}</Text>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.locationText}>
                      {appointment.location.address}, {appointment.location.city}
                    </Text>
                  </View>

                  {appointment.notes && (
                    <Text style={styles.notesText} numberOfLines={1}>
                      {appointment.notes}
                    </Text>
                  )}
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.priceText}>£{appointment.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  dateSection: {
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeColumn: {
    width: 70,
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 2,
    borderRightColor: '#007AFF',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  timeDivider: {
    width: 1,
    height: 8,
    backgroundColor: '#007AFF',
    marginVertical: 4,
  },
  timeTextSmall: {
    fontSize: 13,
    color: '#999',
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  priceColumn: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
});
