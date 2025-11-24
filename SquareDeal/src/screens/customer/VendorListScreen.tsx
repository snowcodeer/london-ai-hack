import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  findAllServiceProviders,
  MatchingResult,
  getMatchingSummaryMessage,
  shouldShowUnverifiedVendors,
} from '../../services/matchingWithValyu';
import { ProblemCategory, ServiceRequest } from '../../types';
import UnverifiedVendorCard from '../../components/UnverifiedVendorCard';
import VerifiedBusinessCard from '../../components/VerifiedBusinessCard';

interface RouteParams {
  latitude: number;
  longitude: number;
  category: ProblemCategory;
  aiDescription?: string;
  radiusMiles?: number;
  address?: string;
  city?: string;
}

export default function VendorListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    latitude,
    longitude,
    category,
    aiDescription,
    radiusMiles = 25,
    address = '',
    city = 'London',
  } = route.params as RouteParams;

  const [isLoading, setIsLoading] = useState(true);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create a mock service request for email generation
  const mockServiceRequest: ServiceRequest = {
    id: 'temp-' + Date.now(),
    customer_id: 'temp-customer',
    customer_name: 'Customer',
    customer_phone: '',
    customer_email: '',
    problem_photo_url: '',
    ai_description: aiDescription || 'Service request',
    problem_category: category,
    urgency: 'medium',
    location: {
      address: address || 'London',
      city: city,
      state: 'England',
      zip: '',
      coordinates: {
        latitude,
        longitude,
      },
    },
    matched_business_ids: [],
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    searchForProviders();
  }, []);

  const searchForProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await findAllServiceProviders({
        latitude,
        longitude,
        category,
        radiusMiles,
        aiDescription,
      });

      setMatchingResult(result);
    } catch (err) {
      console.error('Error searching for providers:', err);
      setError('Failed to search for service providers. Please try again.');
      Alert.alert(
        'Search Failed',
        'We encountered an error while searching for service providers. Please try again.',
        [
          { text: 'Retry', onPress: searchForProviders },
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Searching for service providers...</Text>
        <Text style={styles.loadingSubText}>
          This may take a few moments
        </Text>
      </View>
    );
  }

  if (error || !matchingResult) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={searchForProviders}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasVerifiedBusinesses = matchingResult.verifiedBusinesses.length > 0;
  const hasUnverifiedVendors = matchingResult.unverifiedVendors.length > 0;
  const hasAnyProviders = hasVerifiedBusinesses || hasUnverifiedVendors;
  // Show unverified vendors section if we have any (even if we also have verified businesses)
  const showUnverified = hasUnverifiedVendors;

  return (
    <ScrollView style={styles.container}>
      {/* Header Summary */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Providers</Text>
        <Text style={styles.headerSubtitle}>
          Found {matchingResult.verifiedBusinesses.length} verified and{' '}
          {matchingResult.unverifiedVendors.length} unverified providers in your area
        </Text>
      </View>

      {/* Combined Provider List */}
      {hasAnyProviders && (
        <View style={styles.section}>
          {/* Info box about unverified vendors if present */}
          {hasUnverifiedVendors && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Showing verified providers first, followed by unverified local businesses.
                Unverified businesses are not yet on our platform - please contact them directly.
              </Text>
            </View>
          )}

          {/* Verified Businesses - Sorted by Distance */}
          {matchingResult.verifiedBusinesses.map((match) => (
            <VerifiedBusinessCard
              key={match.business.id}
              business={match.business}
              distanceMiles={match.distanceMiles}
              onPress={() => {
                // TODO: Navigate to booking screen
                console.log('Book service with:', match.business.name);
              }}
            />
          ))}
        </View>
      )}

      {/* Unverified Vendors Section */}
      {hasUnverifiedVendors && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="search" size={24} color="#FF9500" />
            <Text style={styles.sectionTitle}>
              {hasVerifiedBusinesses ? 'Additional Local Businesses' : 'Local Businesses Nearby'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              These businesses are not yet verified on our platform. You can invite them to join by clicking the "Invite to Platform" button.
            </Text>
          </View>

          {/* Unverified Vendors - Sorted by Distance */}
          {matchingResult.unverifiedVendors.map((vendor, index) => (
            <UnverifiedVendorCard
              key={`unverified-${index}`}
              vendor={vendor}
              serviceRequest={mockServiceRequest}
              onPress={() => {
                // TODO: Navigate to vendor detail screen
                console.log('Vendor pressed:', vendor.company_name);
              }}
            />
          ))}

          {/* Recommendations from Valyu */}
          {matchingResult.valyuSearchResult?.metadata?.recommendations && (
            <View style={styles.recommendationsBox}>
              <Text style={styles.recommendationsTitle}>
                <Ionicons name="bulb-outline" size={16} color="#FF9500" /> Recommendations
              </Text>
              <Text style={styles.recommendationsText}>
                {matchingResult.valyuSearchResult.metadata.recommendations}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* No Results */}
      {!hasAnyProviders && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={60} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Providers Found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find any service providers in your area for this type of service.
          </Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => {
              // TODO: Implement radius expansion
              console.log('Expand search radius');
            }}
          >
            <Text style={styles.expandButtonText}>Expand Search Area</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 8,
    lineHeight: 18,
  },
  recommendationsBox: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9500',
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  expandButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  expandButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    paddingHorizontal: 12,
  },
});
