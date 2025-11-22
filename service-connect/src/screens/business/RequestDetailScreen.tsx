import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateServiceRequest } from '../../services/database';
import { ServiceRequest } from '../../types';
import { useOrganization } from '../../contexts/MockAuthContext';

export default function RequestDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { organization } = useOrganization();
  const { request } = route.params as { request: ServiceRequest };

  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    if (!organization) return;

    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this service request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              setIsAccepting(true);

              updateServiceRequest(request.id, {
                status: 'accepted',
                assigned_business_id: organization.id,
                responded_at: new Date().toISOString(),
              });

              // TODO: Send notification to customer
              // TODO: Create calendar event via ACI.dev

              Alert.alert(
                'Request Accepted!',
                'The customer will be notified. You can now coordinate the appointment.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error accepting request:', error);
              Alert.alert('Error', 'Failed to accept request. Please try again.');
            } finally {
              setIsAccepting(false);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    if (!organization) return;

    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeclining(true);

              // Remove this business from matched_business_ids
              const updatedMatches = request.matched_business_ids.filter(
                (id) => id !== organization.id
              );

              updateServiceRequest(request.id, {
                matched_business_ids: updatedMatches,
                responded_at: new Date().toISOString(),
              });

              // TODO: If no more businesses, trigger ACI outreach email

              navigation.goBack();
            } catch (error) {
              console.error('Error declining request:', error);
              Alert.alert('Error', 'Failed to decline request. Please try again.');
            } finally {
              setIsDeclining(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL(`tel:${request.customer_phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${request.customer_phone}`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Problem Photo */}
        <Image
          source={{ uri: request.problem_photo_url }}
          style={styles.photoHeader}
          resizeMode="cover"
        />

        {/* Urgency Badge */}
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: getUrgencyColor(request.urgency) },
          ]}
        >
          <Ionicons name="alert-circle" size={16} color="white" style={{ marginRight: 6 }} />
          <Text style={styles.urgencyText}>
            {request.urgency.toUpperCase()} PRIORITY
          </Text>
        </View>

        <View style={styles.content}>
          {/* Category */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Service Type</Text>
            <Text style={styles.categoryValue}>
              {request.problem_category.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {/* Problem Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Description</Text>
            <View style={styles.card}>
              <Text style={styles.descriptionText}>
                {request.ai_description}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#007AFF" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoText}>{request.location.address}</Text>
                  <Text style={styles.infoSubText}>
                    {request.location.city}, {request.location.state}{' '}
                    {request.location.zip}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoText}>{request.customer_name}</Text>
                  <Text style={styles.infoSubText}>{request.customer_email}</Text>
                  <Text style={styles.infoSubText}>{request.customer_phone}</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
                  <Ionicons name="call" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                  <Text style={styles.quickActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={handleMessage}
                >
                  <Ionicons name="chatbubble" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                  <Text style={styles.quickActionText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Appointment Preferences (if available) */}
          {request.appointment_details && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appointment Preferences</Text>
              <View style={styles.card}>
                {request.appointment_details.preferred_date && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                    <Text style={styles.infoText}>
                      {request.appointment_details.preferred_date}
                    </Text>
                  </View>
                )}
                {request.appointment_details.preferred_time && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time" size={20} color="#007AFF" />
                    <Text style={styles.infoText}>
                      {request.appointment_details.preferred_time}
                    </Text>
                  </View>
                )}
                {request.appointment_details.additional_notes && (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text" size={20} color="#007AFF" />
                    <Text style={styles.infoText}>
                      {request.appointment_details.additional_notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.declineButton, ...(isDeclining ? [styles.buttonDisabled] : [])]}
          onPress={handleDecline}
          disabled={isAccepting || isDeclining}
        >
          {isDeclining ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="close-circle" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptButton, ...(isAccepting ? [styles.buttonDisabled] : [])]}
          onPress={handleAccept}
          disabled={isAccepting || isDeclining}
        >
          {isAccepting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  photoHeader: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 260,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  categoryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  infoSubText: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 6,
  },
  declineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
