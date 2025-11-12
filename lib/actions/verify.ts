'use server'

import { prisma } from '@/lib/prisma'
import { verifyFormSchema, type VerifyFormInput } from '@/lib/validation/verify'

export interface VerifySubmissionResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

/**
 * Submits verification form
 * - Validates token and form data
 * - Creates VerificationEvent for form submission
 * - Creates ContactChangeSet tracking changes
 * - Updates recipient status to 'submitted'
 * - Optionally updates contact via Ginkgo API
 */
export async function submitVerification(input: VerifyFormInput): Promise<VerifySubmissionResult> {
  try {
    // Validate input
    const validatedData = verifyFormSchema.parse(input)

    // Find recipient by token
    const recipient = await prisma.verificationRecipient.findUnique({
      where: { token: validatedData.token },
    })

    if (!recipient) {
      return {
        success: false,
        error: 'This link is no longer valid',
      }
    }

    // Check if token is expired
    if (new Date() > recipient.tokenExpiresAt) {
      return {
        success: false,
        error: 'This link has expired. Please request a new verification email.',
      }
    }

    // Check if already submitted
    if (recipient.status !== 'pending') {
      return {
        success: false,
        error: 'This verification has already been submitted',
      }
    }

    // Build change data
    const afterData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      mailing_address: validatedData.mailing_address,
      i_am_owner: validatedData.i_am_owner,
      preferred_channel: validatedData.preferred_channel,
      allow_updates: validatedData.allow_updates,
    }

    // Create VerificationEvent for form submission
    await prisma.verificationEvent.create({
      data: {
        recipientId: recipient.id,
        type: 'form_submitted',
        meta: {
          fields_updated: Object.keys(afterData),
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Create ContactChangeSet to track changes
    await prisma.contactChangeSet.create({
      data: {
        recipientId: recipient.id,
        beforeJson: {}, // In production, would store original contact data
        afterJson: afterData,
      },
    })

    // Update recipient status and timestamp
    await prisma.verificationRecipient.update({
      where: { id: recipient.id },
      data: {
        status: 'submitted',
        lastActivityAt: new Date(),
      },
    })

    // TODO: Call Ginkgo API PUT to update contact record
    // await updateContactViaGinkgo(recipient, afterData)

    return {
      success: true,
      redirectUrl: `/verify/${recipient.token}/thank-you`,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Verification submission error:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Reports an issue with a verification link
 * Creates a VerificationEvent with type 'issue_reported'
 */
export async function reportVerificationIssue(token: string, message: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Find recipient by token
    const recipient = await prisma.verificationRecipient.findUnique({
      where: { token },
    })

    if (!recipient) {
      return {
        success: false,
        error: 'Token not found',
      }
    }

    // Create event for issue report
    await prisma.verificationEvent.create({
      data: {
        recipientId: recipient.id,
        type: 'issue_reported',
        meta: {
          message,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Report issue error:', error)
    return {
      success: false,
      error: 'Failed to report issue',
    }
  } finally {
    await prisma.$disconnect()
  }
}
