'use server'

import { PrismaClient } from '@prisma/client'
import { type VerificationSummary } from '@/lib/validation/verify'

const prisma = new PrismaClient()

export interface TokenValidationResult {
  valid: boolean
  error?: string
  recipient?: {
    id: string
    email: string
    status: string
    firstName?: string
    lastName?: string
    contactId: number
    primaryType: 'Property' | 'Business'
    primaryRecordId: number
    summary?: VerificationSummary
  }
}

/**
 * Validates a verification token and returns recipient data
 * Returns error if:
 * - Token is invalid/not found
 * - Token is expired
 * - Recipient status is not 'pending' (already submitted)
 */
export async function validateVerificationToken(token: string): Promise<TokenValidationResult> {
  try {
    // Find recipient by token
    const recipient = await prisma.verificationRecipient.findUnique({
      where: { token },
      include: {
        campaign: true,
      },
    })

    if (!recipient) {
      return {
        valid: false,
        error: 'This link is no longer valid',
      }
    }

    // Check if token is expired
    if (new Date() > recipient.tokenExpiresAt) {
      return {
        valid: false,
        error: 'This link has expired. Please request a new verification email.',
      }
    }

    // Check if already submitted
    if (recipient.status !== 'pending') {
      return {
        valid: true,
        error: 'already_submitted',
        recipient: {
          id: recipient.id,
          email: recipient.status === 'submitted' ? '' : '',
          status: recipient.status,
          contactId: recipient.contactId,
          primaryType: recipient.primaryType as 'Property' | 'Business',
          primaryRecordId: recipient.primaryRecordId,
        },
      }
    }

    return {
      valid: true,
      recipient: {
        id: recipient.id,
        email: '',
        status: recipient.status,
        firstName: undefined,
        lastName: undefined,
        contactId: recipient.contactId,
        primaryType: recipient.primaryType as 'Property' | 'Business',
        primaryRecordId: recipient.primaryRecordId,
      },
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      valid: false,
      error: 'An error occurred while validating your link',
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Fetches recipient data with full details
 */
export async function getRecipientDetails(recipientId: string): Promise<VerificationSummary | null> {
  try {
    const recipient = await prisma.verificationRecipient.findUnique({
      where: { id: recipientId },
    })

    if (!recipient) {
      return null
    }

    // In a production system, you'd fetch from Ginkgo API or cache
    // For now, return summary with available data
    return {
      contactId: recipient.contactId,
      primaryType: recipient.primaryType as 'Property' | 'Business',
    }
  } catch (error) {
    console.error('Failed to fetch recipient details:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
