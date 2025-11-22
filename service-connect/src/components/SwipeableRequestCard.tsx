import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceRequest } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

interface Props {
  request: ServiceRequest;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableRequestCard({ request, onSwipeLeft, onSwipeRight }: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - Accept
          Animated.spring(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Decline
          Animated.spring(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const animatedCardStyle = {
    transform: [{ translateX: pan.x }, { rotate }],
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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

  const priceColor = request.customer_budget && request.floor_price
    ? request.customer_budget >= request.floor_price
      ? '#34C759'
      : '#FF3B30'
    : '#007AFF';

  return (
    <Animated.View
      style={[styles.card, animatedCardStyle]}
      {...panResponder.panHandlers}
    >
      {/* Swipe indicators */}
      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <Text style={styles.likeLabelText}>ACCEPT</Text>
      </Animated.View>
      <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
        <Text style={styles.nopeLabelText}>DECLINE</Text>
      </Animated.View>

      {/* Problem photo */}
      <Image source={{ uri: request.problem_photo_url }} style={styles.photo} />

      {/* Urgency badge */}
      <View
        style={[
          styles.urgencyBadge,
          { backgroundColor: getUrgencyColor(request.urgency) },
        ]}
      >
        <Ionicons name="alert-circle" size={16} color="white" />
        <Text style={styles.urgencyText}>{request.urgency.toUpperCase()}</Text>
      </View>

      {/* Card content */}
      <View style={styles.content}>
        {/* Price section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Ionicons name="cash-outline" size={24} color={priceColor} />
            <Text style={[styles.priceAmount, { color: priceColor }]}>
              £{request.customer_budget || request.suggested_price || 0}
            </Text>
          </View>
          {request.floor_price && request.customer_budget && request.customer_budget < request.floor_price && (
            <Text style={styles.priceWarning}>
              Below minimum £{request.floor_price}
            </Text>
          )}
        </View>

        {/* Service type */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {request.problem_category.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {request.ai_description}
        </Text>

        {/* Location & Distance */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="#666" />
          <Text style={styles.locationText}>
            {request.location.city}
            {request.distance_miles && ` • ${request.distance_miles.toFixed(1)} mi away`}
          </Text>
        </View>

        {/* Customer info */}
        <View style={styles.customerRow}>
          <Ionicons name="person-circle-outline" size={18} color="#666" />
          <Text style={styles.customerText}>{request.customer_name}</Text>
        </View>

        {/* Time preference */}
        {request.appointment_details?.preferred_date && (
          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.timeText}>
              {request.appointment_details.preferred_date}
              {request.appointment_details.preferred_time &&
                ` at ${request.appointment_details.preferred_time}`}
            </Text>
          </View>
        )}
      </View>

      {/* Swipe instructions */}
      <View style={styles.instructionsRow}>
        <View style={styles.instruction}>
          <Ionicons name="arrow-back" size={20} color="#FF3B30" />
          <Text style={styles.instructionText}>Decline</Text>
        </View>
        <View style={styles.instruction}>
          <Ionicons name="arrow-forward" size={20} color="#34C759" />
          <Text style={styles.instructionText}>Accept</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 40,
    height: '75%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
    borderWidth: 4,
    borderColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    transform: [{ rotate: '20deg' }],
  },
  likeLabelText: {
    color: '#34C759',
    fontSize: 32,
    fontWeight: '800',
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1000,
    borderWidth: 4,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    transform: [{ rotate: '-20deg' }],
  },
  nopeLabelText: {
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: '800',
  },
  photo: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 210,
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
    marginLeft: 6,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginLeft: 8,
  },
  priceWarning: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 32,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  instructionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    fontWeight: '600',
  },
});
