import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { compressImage, imageToBase64 } from '../../utils/imageCompression';
import { analyzeImageWithVision, VisionAnalysisResult } from '../../services/openai';
import { uploadProblemPhoto } from '../../services/storage';

export default function ProblemAnalysisScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { photoUri } = route.params as { photoUri: string };

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<VisionAnalysisResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzePhoto();
  }, []);

  const analyzePhoto = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // 1. Compress image
      const compressedUri = await compressImage(photoUri);

      // 2. Convert to base64
      const base64 = await imageToBase64(compressedUri);

      // 3. Upload to Supabase Storage
      setIsUploading(true);
      const uploadedUrl = await uploadProblemPhoto(base64, user!.id);
      setPhotoUrl(uploadedUrl);
      setIsUploading(false);

      // 4. Analyze with OpenAI Vision
      const result = await analyzeImageWithVision(base64);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please try again.');
      Alert.alert(
        'Analysis Failed',
        'We couldn\'t analyze your photo. Would you like to try again?',
        [
          { text: 'Retake Photo', onPress: () => navigation.goBack() },
          { text: 'Retry Analysis', onPress: analyzePhoto },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (!analysis || !photoUrl) return;

    // Navigate to chat/form screen with analysis data
    navigation.navigate('AppointmentDetails', {
      photoUrl,
      analysis,
    });
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  if (isAnalyzing || isUploading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {isUploading ? 'Uploading photo...' : 'Analyzing your problem...'}
            </Text>
            <Text style={styles.loadingSubText}>
              This may take a few seconds
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={analyzePhoto}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photoHeader} />

      <View style={styles.content}>
        {/* Analysis Result */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.sectionTitle}>Problem Identified</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {analysis?.category.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <Text style={styles.description}>{analysis?.description}</Text>

            <View style={styles.urgencyContainer}>
              <Text style={styles.urgencyLabel}>Urgency:</Text>
              <View
                style={[
                  styles.urgencyBadge,
                  analysis?.urgency === 'high' && styles.urgencyHigh,
                  analysis?.urgency === 'medium' && styles.urgencyMedium,
                  analysis?.urgency === 'low' && styles.urgencyLow,
                ]}
              >
                <Text style={styles.urgencyText}>
                  {analysis?.urgency.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Details */}
        {analysis?.keyDetails && analysis.keyDetails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Details</Text>
            <View style={styles.card}>
              {analysis.keyDetails.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetake}
          >
            <Ionicons name="camera-outline" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 20,
  },
  photoHeader: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
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
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  urgencyLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyHigh: {
    backgroundColor: '#FF3B30',
  },
  urgencyMedium: {
    backgroundColor: '#FF9500',
  },
  urgencyLow: {
    backgroundColor: '#34C759',
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
