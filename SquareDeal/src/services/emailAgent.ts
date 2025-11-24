/**
 * Email Agent Service
 *
 * API client for the Python email agent service
 * Handles business invitation email drafting and Gmail draft creation
 */

import { ProblemCategory } from '../types';

// Get API URL from environment or use localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_EMAIL_AGENT_API_URL || 'http://localhost:5000';

export interface DraftInvitationParams {
  businessName: string;
  businessEmail: string;
  problemCategory: ProblemCategory;
  urgency: 'low' | 'medium' | 'high';
  locationCity: string;
  locationArea: string;
  aiSummary: string;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
  businessEmail: string;
}

export interface CreateDraftResult {
  success: boolean;
  draftId?: string;
  message: string;
  gmailUrl?: string;
  error?: string;
}

/**
 * Draft invitation email without creating Gmail draft
 * This generates a preview of the email
 */
export async function draftInvitationEmail(
  params: DraftInvitationParams
): Promise<EmailTemplate> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/draft-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to draft email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error drafting invitation email:', error);
    throw error;
  }
}

/**
 * Create Gmail draft for the invitation email
 * Safer for demo - creates draft instead of sending
 */
export async function createInvitationDraft(
  email: EmailTemplate
): Promise<CreateDraftResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessEmail: email.businessEmail,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create draft');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating invitation draft:', error);
    throw error;
  }
}

/**
 * Check if email agent API is healthy
 */
export async function checkEmailAgentHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Email agent health check failed:', error);
    return false;
  }
}
