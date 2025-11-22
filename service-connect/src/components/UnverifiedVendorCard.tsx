import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnverifiedVendor } from '../services/valyuSearch';

interface UnverifiedVendorCardProps {
  vendor: UnverifiedVendor;
  onPress?: () => void;
}

export default function UnverifiedVendorCard({
  vendor,
  onPress,
}: UnverifiedVendorCardProps) {
  const handleCall = () => {
    if (vendor.phone_number) {
      Linking.openURL(`tel:${vendor.phone_number}`);
    }
  };

  const handleWebsite = () => {
    if (vendor.website_url) {
      Linking.openURL(vendor.website_url);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Unverified Badge */}
      <View style={styles.unverifiedBadge}>
        <Ionicons name="alert-circle-outline" size={14} color="#FF9500" />
        <Text style={styles.unverifiedText}>Unverified</Text>
      </View>

      {/* Company Name */}
      <Text style={styles.companyName}>{vendor.company_name}</Text>

      {/* Rating */}
      {vendor.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {vendor.rating.toFixed(1)}
          </Text>
          {vendor.total_reviews && (
            <Text style={styles.reviewCount}>
              ({vendor.total_reviews} reviews)
            </Text>
          )}
          {vendor.rating_source && (
            <Text style={styles.ratingSource}>
              on {vendor.rating_source}
            </Text>
          )}
        </View>
      )}

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {vendor.description}
      </Text>

      {/* Service Categories */}
      <View style={styles.categoriesContainer}>
        {vendor.service_categories.slice(0, 3).map((category, index) => (
          <View key={index} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>

      {/* Key Features */}
      <View style={styles.featuresContainer}>
        {vendor.same_day_service && (
          <View style={styles.feature}>
            <Ionicons name="flash" size={14} color="#34C759" />
            <Text style={styles.featureText}>Same Day</Text>
          </View>
        )}
        {vendor.emergency_service && (
          <View style={styles.feature}>
            <Ionicons name="alert" size={14} color="#FF3B30" />
            <Text style={styles.featureText}>24/7</Text>
          </View>
        )}
        {vendor.free_estimates && (
          <View style={styles.feature}>
            <Ionicons name="document-text-outline" size={14} color="#007AFF" />
            <Text style={styles.featureText}>Free Estimates</Text>
          </View>
        )}
        {vendor.years_in_business && vendor.years_in_business > 5 && (
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={14} color="#34C759" />
            <Text style={styles.featureText}>
              {vendor.years_in_business} years
            </Text>
          </View>
        )}
      </View>

      {/* Distance and Address */}
      {(vendor.distance_from_user || vendor.address) && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#8E8E93" />
          <Text style={styles.locationText}>
            {vendor.distance_from_user || vendor.address}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {vendor.phone_number && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
          >
            <Ionicons name="call-outline" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        {vendor.website_url && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWebsite}
          >
            <Ionicons name="globe-outline" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Relevance Score (for debugging/testing) */}
      {vendor.relevance_score >= 7 && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Highly Recommended</Text>
        </View>
      )}
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
    borderWidth: 1,
    borderColor: '#FFE4B5',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  ratingSource: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
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
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
});
