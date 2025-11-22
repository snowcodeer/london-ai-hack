import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ServiceRequest, FLOOR_PRICES } from '../../types';
import { useOrganization } from '../../contexts/MockAuthContext';
import { getServiceRequests, updateServiceRequest } from '../../services/database';
import SwipeableRequestCard from '../../components/SwipeableRequestCard';

export default function SwipeableInboxScreen() {
  const { organization } = useOrganization();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [organization]);

  const loadRequests = () => {
    if (!organization) return;

    try {
      const allRequests = getServiceRequests({
        status: 'pending',
        businessId: organization.id,
      });

      // Add distance and pricing info
      const enrichedRequests = allRequests.map((req) => ({
        ...req,
        distance_miles: Math.random() * 10 + 0.5, // Mock distance
        floor_price: FLOOR_PRICES[req.problem_category],
        customer_budget: req.customer_budget || Math.floor(Math.random() * 100) + 80, // Mock budget
      }));

      setRequests(enrichedRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error loading requests:', error);
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!organization || currentIndex >= requests.length) return;

    const request = requests[currentIndex];

    updateServiceRequest(request.id, {
      status: 'accepted',
      assigned_business_id: organization.id,
      responded_at: new Date().toISOString(),
    });

    Alert.alert(
      'Request Accepted! 🎉',
      `You've accepted the job from ${request.customer_name}. They'll be notified shortly.`,
      [{ text: 'Great!' }]
    );

    setCurrentIndex(currentIndex + 1);
  };

  const handleDecline = () => {
    if (currentIndex >= requests.length) return;

    const request = requests[currentIndex];

    // Remove this business from matched_business_ids
    const updatedMatches = request.matched_business_ids.filter(
      (id) => id !== organization?.id
    );

    updateServiceRequest(request.id, {
      matched_business_ids: updatedMatches,
      responded_at: new Date().toISOString(),
    });

    setCurrentIndex(currentIndex + 1);
  };

  const currentRequest = requests[currentIndex];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={60} color="#ccc" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentRequest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>
            No new requests at the moment. We'll notify you when one comes in.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Requests</Text>
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {requests.length}
          </Text>
        </View>
      </View>

      {/* Card stack */}
      <View style={styles.cardContainer}>
        <SwipeableRequestCard
          key={currentRequest.id}
          request={currentRequest}
          onSwipeLeft={handleDecline}
          onSwipeRight={handleAccept}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  counterContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
