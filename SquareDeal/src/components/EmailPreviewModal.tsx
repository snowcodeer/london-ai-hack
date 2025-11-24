/**
 * Email Preview Modal Component
 *
 * Shows a preview of the business invitation email and allows
 * the user to create a Gmail draft
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { draftInvitationEmail, createInvitationDraft, EmailTemplate } from '../services/emailAgent';
import { generateBusinessInvitationEmail } from '../utils/emailTemplates';
import { ServiceRequest } from '../types';

interface EmailPreviewModalProps {
  visible: boolean;
  business: {
    name: string;
    email: string;
  };
  request: ServiceRequest;
  onClose: () => void;
  onSent: () => void;
}

export function EmailPreviewModal({
  visible,
  business,
  request,
  onClose,
  onSent,
}: EmailPreviewModalProps) {
  const [email, setEmail] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load email preview when modal opens
  useEffect(() => {
    if (visible) {
      loadEmailPreview();
    } else {
      // Reset state when modal closes
      setEmail(null);
      setLoading(true);
      setError(null);
    }
  }, [visible]);

  const loadEmailPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use local template generation for immediate demo
      // This doesn't require the Python backend to be running
      const emailTemplate = generateBusinessInvitationEmail({
        businessName: business.name,
        businessEmail: business.email,
        problemCategory: request.problem_category,
        urgency: request.urgency,
        locationCity: request.location.city,
        locationArea: extractArea(request.location.address),
        aiSummary: request.ai_description,
        platformSignupUrl: 'https://serviceconnect.app/signup?ref=invite',
      });

      setEmail({
        ...emailTemplate,
        businessEmail: business.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email preview');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!email) return;

    try {
      setSending(true);

      // Create Gmail compose URL with pre-filled content
      const gmailComposeUrl = createGmailComposeUrl(
        email.businessEmail,
        email.subject,
        email.textBody
      );

      Alert.alert(
        '📧 Email Ready!',
        `We'll open Gmail with your invitation email pre-filled. Review and send when ready!`,
        [
          {
            text: 'Open Gmail',
            onPress: () => {
              Linking.openURL(gmailComposeUrl).catch(err => {
                console.error('Failed to open Gmail:', err);
                Alert.alert('Error', 'Could not open Gmail. Please try again.');
              });
              onSent();
              onClose();
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setSending(false);
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to prepare email',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const createGmailComposeUrl = (to: string, subject: string, body: string): string => {
    const params = new URLSearchParams({
      to,
      su: subject,
      body,
    });
    return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  };

  const extractArea = (address: string): string => {
    // Extract neighborhood/area from full address (first part before comma)
    return address.split(',')[0].trim();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>✉️ Email Preview</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Generating email preview...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <TouchableOpacity onPress={loadEmailPreview} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email Preview */}
          {email && !loading && !error && (
            <>
              {/* Email Metadata */}
              <View style={styles.emailMeta}>
                <Text style={styles.metaLabel}>To:</Text>
                <Text style={styles.metaValue}>{email.businessEmail}</Text>
              </View>
              <View style={styles.emailMeta}>
                <Text style={styles.metaLabel}>Subject:</Text>
                <Text style={styles.metaValue}>{email.subject}</Text>
              </View>

              {/* Email Body */}
              <ScrollView style={styles.emailBody}>
                <Text style={styles.emailBodyText}>{email.textBody}</Text>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.button, styles.cancelButton]}
                  disabled={sending}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateDraft}
                  style={[styles.button, styles.sendButton]}
                  disabled={sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.sendButtonText}>✓ Create Draft</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 700,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emailMeta: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  metaLabel: {
    fontWeight: '700',
    color: '#6b7280',
    width: 80,
    fontSize: 14,
  },
  metaValue: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
  },
  emailBody: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  emailBodyText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
