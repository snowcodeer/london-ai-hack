import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    problem_photo_url: '',
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
    problem_photo_url: '',
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
    problem_photo_url: '',
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
    notes: 'Bathroom tap dripping constantly',
    problem_photo_url: '',
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
    problem_photo_url: '',
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

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
                onPress={() => handleAppointmentPress(appointment)}
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
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                    style={{ marginTop: 4 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={selectedAppointment !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView style={styles.modalContent} bounces={false}>
                {selectedAppointment && (
                  <>
                    {/* Close Button */}
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>

                    {/* Problem Image */}
                    {selectedAppointment.problem_photo_url && (
                      <Image
                        source={{ uri: selectedAppointment.problem_photo_url }}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                    )}

                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <View style={styles.serviceIconContainer}>
                        <Ionicons
                          name={getServiceIcon(selectedAppointment.service_type)}
                          size={24}
                          color="#007AFF"
                        />
                      </View>
                      <View style={styles.headerTextContainer}>
                        <Text style={styles.modalServiceType}>
                          {selectedAppointment.service_type.replace('_', ' ')}
                        </Text>
                        <Text style={styles.modalTime}>
                          {selectedAppointment.time_start} - {selectedAppointment.time_end}
                        </Text>
                      </View>
                      <Text style={styles.modalPrice}>£{selectedAppointment.price}</Text>
                    </View>

                    {/* Modal Body */}
                    <View style={styles.modalBody}>
                      {selectedAppointment.notes && (
                        <View style={styles.notesSection}>
                          <Text style={styles.sectionTitle}>Details</Text>
                          <Text style={styles.modalNotes}>{selectedAppointment.notes}</Text>
                        </View>
                      )}

                      {/* Customer Details */}
                      <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Customer Information</Text>
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={20} color="#007AFF" />
                          <Text style={styles.detailText}>
                            {selectedAppointment.customer_name}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="call-outline" size={20} color="#007AFF" />
                          <Text style={styles.detailText}>
                            {selectedAppointment.customer_phone}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={20} color="#007AFF" />
                          <Text style={styles.detailText}>
                            {selectedAppointment.location.address}, {selectedAppointment.location.city}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={styles.callButton}
                          onPress={() => {
                            // Handle call action
                            closeModal();
                          }}
                        >
                          <Ionicons name="call" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Call Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.directionsButton}
                          onPress={() => {
                            // Handle directions action
                            closeModal();
                          }}
                        >
                          <Ionicons name="navigate" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Get Directions</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontSize: 14,
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
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    maxHeight: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#f0f0f0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalServiceType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    color: '#666',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  modalBody: {
    padding: 20,
  },
  notesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalNotes: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
