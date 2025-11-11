/**
 * Simple ESP (Email Service Provider) client for Mailchimp and Constant Contact
 * Handles merge fields, subscriber management, and basic operations
 */

interface MergeField {
  name: string
  type: 'text' | 'email' | 'number' | 'date' | 'dropdown' | 'phone' | 'url' | 'imageref'
}

interface MailchimpResponse {
  id?: string
  email_address?: string
  status?: string
  errors?: Array<{ error: string }>
  error?: string
  detail?: string
}

interface ConstantContactResponse {
  id?: string
  email_address?: string
  status?: string
  error?: string
  message?: string
}

/**
 * Mailchimp API client
 */
export class MailchimpClient {
  private apiKey: string
  private server: string
  private listId: string

  constructor(apiKey: string, listId: string) {
    this.apiKey = apiKey
    this.listId = listId
    // Extract server from API key (format: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1)
    this.server = apiKey.split('-')[1] || 'us1'
  }

  private getBaseUrl() {
    return `https://${this.server}.api.mailchimp.com/3.0`
  }

  private getAuthHeader() {
    return {
      Authorization: `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Create or update merge fields in Mailchimp
   */
  async ensureMergeFields(): Promise<boolean> {
    try {
      const fields = [
        { name: 'FIRST_NAME', type: 'text' },
        { name: 'LAST_NAME', type: 'text' },
        { name: 'BUSINESS', type: 'text' },
        { name: 'ADDRESS', type: 'text' },
        { name: 'OWNER_TYPE', type: 'text' },
      ]

      for (const field of fields) {
        await fetch(
          `${this.getBaseUrl()}/lists/${this.listId}/merge-fields`,
          {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify({
              tag: field.name,
              name: field.name.replace('_', ' '),
              type: field.type,
            }),
          }
        ).then(r => r.json()) // Ignore errors (field may already exist)
      }

      return true
    } catch (error) {
      console.error('Mailchimp ensureMergeFields error:', error)
      return false
    }
  }

  /**
   * Add or update subscriber
   */
  async addOrUpdateSubscriber(email: string, data: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/lists/${this.listId}/members/${this.hashEmail(email)}`,
        {
          method: 'PUT',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
            merge_fields: {
              FNAME: data.first_name || '',
              LNAME: data.last_name || '',
              MMERGE3: data.business_name || '',
              MMERGE4: data.property_address || '',
              MMERGE5: data.owner_type || '',
            },
            tags: ['verification'],
          }),
        }
      )

      const result = (await response.json()) as MailchimpResponse
      if (result.error || result.errors) {
        console.error('Mailchimp addOrUpdateSubscriber error:', result.error || result.errors)
        return false
      }

      return true
    } catch (error) {
      console.error('Mailchimp addOrUpdateSubscriber error:', error)
      return false
    }
  }

  /**
   * Hash email for Mailchimp API (MD5)
   */
  private hashEmail(email: string): string {
    // In production, use crypto.createHash('md5')
    // For now, return email as fallback
    const crypto = require('crypto')
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
  }
}

/**
 * Constant Contact API client
 */
export class ConstantContactClient {
  private accessKey: string
  private listId: string

  constructor(accessKey: string, listId: string) {
    this.accessKey = accessKey
    this.listId = listId
  }

  private getBaseUrl() {
    return 'https://api.cc.email/v3'
  }

  private getAuthHeader() {
    return {
      Authorization: `Bearer ${this.accessKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Create custom fields in Constant Contact
   */
  async ensureCustomFields(): Promise<boolean> {
    try {
      const fields = [
        'first_name',
        'last_name',
        'business_name',
        'property_address',
        'owner_type',
      ]

      // Constant Contact has predefined fields, just validate access
      const response = await fetch(`${this.getBaseUrl()}/contact_custom_fields`, {
        headers: this.getAuthHeader(),
      })

      return response.ok
    } catch (error) {
      console.error('Constant Contact ensureCustomFields error:', error)
      return false
    }
  }

  /**
   * Add or update contact
   */
  async addOrUpdateContact(email: string, data: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/contacts/sign_up_form`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          email_address: {
            address: email,
          },
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          custom_fields: [
            {
              custom_field_id: 'business_name',
              value: data.business_name || '',
            },
            {
              custom_field_id: 'property_address',
              value: data.property_address || '',
            },
            {
              custom_field_id: 'owner_type',
              value: data.owner_type || '',
            },
          ],
          list_memberships: [this.listId],
        }),
      })

      if (!response.ok) {
        const result = (await response.json()) as ConstantContactResponse
        console.error('Constant Contact addOrUpdateContact error:', result.error || result.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Constant Contact addOrUpdateContact error:', error)
      return false
    }
  }
}

/**
 * Factory to create ESP client based on provider
 */
export function createEspClient(
  provider: 'mailchimp' | 'constant_contact',
  accessKey: string,
  listId: string,
  accessSecret?: string
): MailchimpClient | ConstantContactClient {
  if (provider === 'mailchimp') {
    return new MailchimpClient(accessKey, listId)
  } else {
    return new ConstantContactClient(accessKey, listId)
  }
}
