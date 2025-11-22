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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOrganization } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { ServiceRequest } from '../../types';

export default function RequestInboxScreen() {
  const navigation = useNavigation();
  const { organization } = useOrganization();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
    setupRealtimeSubscription();
  }, [organization]);

  const loadRequests = async () => {
    if (!organization) return;

    try {
      // Load pending requests that match this business
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .contains('matched_business_ids', [organization.id])
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!organization) return;

    const subscription = supabase
      .channel('service_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
        },
        (payload) => {
          console.log('Request update:', payload);
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const handleRequestPress = (request: ServiceRequest) => {
    navigation.navigate('RequestDetail', { request });
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

  const renderRequestCard = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRequestPress(item)}
      activeOpacity={0.7}
    >
      {/* Header with urgency indicator */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.urgencyIndicator,
            { backgroundColor: getUrgencyColor(item.urgency) },
          ]}
        />
        <View style={styles.cardHeaderText}>
          <Text style={styles.categoryText}>
            {item.problem_category.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
      </View>

      {/* Photo and Description */}
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.problem_photo_url }}
          style={styles.thumbnail}
        />
        <View style={styles.description}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.ai_description}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.city}, {item.location.state}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.cardFooter}>
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.customerName}>{item.customer_name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

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
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  urgencyIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  cardHeaderText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  description: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
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
});
