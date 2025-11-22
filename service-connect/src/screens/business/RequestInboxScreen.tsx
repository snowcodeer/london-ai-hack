import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import { useOrganization } from '../../contexts/MockAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getServiceRequests } from '../../services/database';
import { ServiceRequest } from '../../types';

export default function RequestInboxScreen() {
  const navigation = useNavigation();
  const { organization } = useOrganization();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    loadRequests();
    // Poll for updates every 5 seconds (replaces real-time)
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [organization]);

  const loadRequests = () => {
    if (!organization) return;

    try {
      // Load pending requests that match this business
      const data = getServiceRequests({
        status: 'pending',
        businessId: organization.id,
      });

      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const handleRequestPress = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const handleAccept = (request: ServiceRequest) => {
    // Navigate to detail screen for accepting
    navigation.navigate('RequestDetail', { request });
  };

  const handleDecline = (requestId: string) => {
    // Remove from list or mark as declined
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceText = (request: ServiceRequest) => {
    if (!organization?.location?.coordinates || !request.location?.coordinates) {
      return '';
    }
    const distance = calculateDistance(
      organization.location.coordinates.latitude,
      organization.location.coordinates.longitude,
      request.location.coordinates.latitude,
      request.location.coordinates.longitude
    );
    return `${distance.toFixed(1)} mi`;
  };

  const renderRequestCard = ({ item }: { item: ServiceRequest }) => {
    const distanceText = getDistanceText(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleRequestPress(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.urgencyDot,
                { backgroundColor: getUrgencyColor(item.urgency) },
              ]}
            />
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.problem_category.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeText} numberOfLines={1}>
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Image
            source={{ uri: item.problem_photo_url }}
            style={styles.thumbnail}
          />
          <View style={styles.description}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.ai_description}
            </Text>
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={12} color="#999" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.location.city}
                </Text>
              </View>
              {distanceText && (
                <View style={styles.metaItem}>
                  <Ionicons name="navigate" size={12} color="#999" />
                  <Text style={styles.metaText}>{distanceText}</Text>
                </View>
              )}
              {item.customer_budget && (
                <View style={styles.metaItem}>
                  <Text style={styles.budgetText}>£{item.customer_budget}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Requests</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{requests.length}</Text>
        </View>
      </View>

      {/* Request List */}
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No new requests</Text>
          <Text style={styles.emptySubText}>
            You'll be notified when customers need your services
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={selectedRequest !== null}
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
                {selectedRequest && (
                  <>
                    {/* Close Button */}
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>

                    {/* Problem Image */}
                    <Image
                      source={{ uri: selectedRequest.problem_photo_url }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />

                    {/* Category Badge */}
                    <View style={styles.modalHeader}>
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: getUrgencyColor(selectedRequest.urgency) },
                        ]}
                      >
                        <Ionicons name="alert-circle" size={16} color="white" />
                        <Text style={styles.urgencyText}>
                          {selectedRequest.urgency.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {selectedRequest.problem_category.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <View style={styles.modalBody}>
                      <Text style={styles.modalDescription}>
                        {selectedRequest.ai_description}
                      </Text>

                      {/* Details */}
                      <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={20} color="#007AFF" />
                          <Text style={styles.detailText}>
                            {selectedRequest.customer_name}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={20} color="#007AFF" />
                          <Text style={styles.detailText}>
                            {selectedRequest.location.address}, {selectedRequest.location.city}
                          </Text>
                        </View>
                        {getDistanceText(selectedRequest) && (
                          <View style={styles.detailRow}>
                            <Ionicons name="navigate-outline" size={20} color="#007AFF" />
                            <Text style={styles.detailText}>
                              {getDistanceText(selectedRequest)} away
                            </Text>
                          </View>
                        )}
                        {selectedRequest.customer_budget && (
                          <View style={styles.detailRow}>
                            <Ionicons name="cash-outline" size={20} color="#34C759" />
                            <Text style={[styles.detailText, { color: '#34C759', fontWeight: '700' }]}>
                              £{selectedRequest.customer_budget}
                            </Text>
                          </View>
                        )}
                        <View style={styles.detailRow}>
                          <Ionicons name="time-outline" size={20} color="#666" />
                          <Text style={styles.detailText}>
                            {formatTimeAgo(selectedRequest.created_at)}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={[styles.modalActionButton, styles.declineButton]}
                          onPress={() => {
                            handleDecline(selectedRequest.id);
                            closeModal();
                          }}
                        >
                          <Ionicons name="close" size={24} color="white" />
                          <Text style={styles.modalActionText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalActionButton, styles.acceptButton]}
                          onPress={() => {
                            handleAccept(selectedRequest);
                            closeModal();
                          }}
                        >
                          <Ionicons name="checkmark" size={24} color="white" />
                          <Text style={styles.modalActionText}>Accept</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    flexShrink: 0,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  description: {
    flex: 1,
    justifyContent: 'space-between',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  budgetText: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    gap: 14,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  modalActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
