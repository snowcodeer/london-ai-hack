import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types';

interface VerifiedBusinessCardProps {
  business: Business;
  distanceMiles: number;
  onPress?: () => void;
}

export default function VerifiedBusinessCard({
  business,
  distanceMiles,
  onPress,
}: VerifiedBusinessCardProps) {
  const handleCall = () => {
    if (business.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      Linking.openURL(business.website);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Verified Badge */}
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark-circle" size={14} color="#34C759" />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>

      {/* Company Name */}
      <Text style={styles.companyName}>{business.name}</Text>

      {/* Service Categories */}
      <View style={styles.categoriesContainer}>
        {business.categories.slice(0, 3).map((category, index) => (
          <View key={index} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {category.replace('_', ' ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Description */}
      {business.description && (
        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>
      )}

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        {business.total_completed > 0 && (
          <View style={styles.stat}>
            <Ionicons name="checkmark-done" size={14} color="#34C759" />
            <Text style={styles.statText}>
              {business.total_completed} completed
            </Text>
          </View>
        )}
        {business.response_time_avg_minutes && (
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={14} color="#007AFF" />
            <Text style={styles.statText}>
              ~{business.response_time_avg_minutes}min response
            </Text>
          </View>
        )}
        {business.years_in_business && (
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>
              {business.years_in_business} years
            </Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {business.is_verified && (
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={14} color="#34C759" />
            <Text style={styles.featureText}>Verified</Text>
          </View>
        )}
        {business.is_insured && (
          <View style={styles.feature}>
            <Ionicons name="shield-outline" size={14} color="#007AFF" />
            <Text style={styles.featureText}>Insured</Text>
          </View>
        )}
      </View>

      {/* Location and Distance */}
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color="#8E8E93" />
        <Text style={styles.locationText}>
          {business.location.city} • {distanceMiles} miles away
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={18} color="#007AFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        {business.website && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWebsite}
          >
            <Ionicons name="globe-outline" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton]}
          onPress={onPress}
        >
          <Text style={styles.bookButtonText}>Book Service</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F9EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 4,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  bookButton: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bookButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});
