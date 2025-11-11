import { type VerificationRecipientData } from '@/lib/validation/campaign'

/**
 * Generates a CSV string from verification recipient data
 * Columns: email,first_name,last_name,business_name,property_address,owner_type,verification_link
 */
export function generateVerificationCsv(
  recipients: VerificationRecipientData[],
  appBaseUrl: string
): string {
  const rows: string[] = [
    'email,first_name,last_name,business_name,property_address,owner_type,verification_link',
  ]

  for (const recipient of recipients) {
    const escapeCsvField = (field: string | undefined): string => {
      if (!field) return ''
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }

    const verificationLink = `${appBaseUrl}/verify/${recipient.token}`

    const row = [
      escapeCsvField(recipient.email),
      escapeCsvField(recipient.firstName),
      escapeCsvField(recipient.lastName),
      escapeCsvField(recipient.businessName),
      escapeCsvField(recipient.propertyAddress),
      escapeCsvField(recipient.primaryType),
      escapeCsvField(verificationLink),
    ].join(',')

    rows.push(row)
  }

  return rows.join('\n')
}

/**
 * Triggers a browser download of a CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
