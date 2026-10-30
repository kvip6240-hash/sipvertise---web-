/**
 * Sipvertise Campaign API Service
 * Centralized API client for all campaign endpoints.
 */

/**
 * Resolves the backend API base URL from Vite environment variables
 * @returns {string} Clean base URL without trailing slashes
 */
export const getApiBaseUrl = () => {
  // Check Vite client-side environment variable
  const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined
  // Fallback to process.env if running under Node/test runner
  const nodeEnv = typeof process !== 'undefined' && process.env ? process.env.VITE_API_BASE_URL : undefined
  const envUrl = viteEnv || nodeEnv

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return 'http://localhost:5000'
}

/**
 * Fetch dynamic campaign types and bottle quantity options from the backend
 * @returns {Promise<{ campaignTypes: string[], bottleQuantities: string[] }>}
 */
export async function fetchCampaignOptions() {
  const baseUrl = getApiBaseUrl()
  const endpoint = `${baseUrl}/api/campaigns/options`

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const message = errorData?.message || `Failed to fetch options (HTTP ${response.status})`
      const error = new Error(message)
      error.status = response.status
      error.details = errorData
      throw error
    }

    const data = await response.json()
    return {
      campaignTypes: Array.isArray(data?.campaignTypes) ? data.campaignTypes : [],
      bottleQuantities: Array.isArray(data?.bottleQuantities) ? data.bottleQuantities : []
    }
  } catch (err) {
    if (typeof import.meta !== 'undefined' && !import.meta.env?.PROD) {
      console.warn('[campaignApi] fetchCampaignOptions error:', err.message)
    }
    throw err
  }
}

/**
 * Submit campaign brief form to the backend
 * @param {Object} campaignData
 * @param {string} campaignData.companyName - Brand / Company Name
 * @param {string} campaignData.contactPerson - Contact Person Name
 * @param {string} campaignData.email - Contact Email Address
 * @param {string} campaignData.phoneNumber - Contact Phone Number
 * @param {string} [campaignData.campaignType] - Campaign Category
 * @param {string} [campaignData.bottleQuantity] - Estimated Bottle Quantity
 * @param {string} [campaignData.message] - Campaign brief / details
 * @returns {Promise<Object>} Backend response with success, leadId, data, notifications, whatsappDirectUrl
 */
export async function submitCampaign(campaignData) {
  const baseUrl = getApiBaseUrl()
  const endpoint = `${baseUrl}/api/campaigns`

  // Normalize payload field names for backend validator compatibility
  const payload = {
    companyName: (campaignData.companyName || campaignData.company || campaignData.brandName || '').trim(),
    contactPerson: (campaignData.contactPerson || campaignData.contact_person || campaignData.name || '').trim(),
    email: (campaignData.email || '').trim().toLowerCase(),
    phoneNumber: (campaignData.phoneNumber || campaignData.phone || '').trim(),
    campaignType: campaignData.campaignType || campaignData.campaign_type || undefined,
    bottleQuantity: campaignData.bottleQuantity || campaignData.quantity || undefined,
    message: (campaignData.message || campaignData.campaignDetails || '').trim() || undefined
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`)
      error.status = response.status
      error.errors = Array.isArray(data?.errors) ? data.errors : []
      error.data = data
      throw error
    }

    return data
  } catch (err) {
    if (typeof import.meta !== 'undefined' && !import.meta.env?.PROD) {
      console.error('[campaignApi] submitCampaign error:', err.status || 'NETWORK_ERROR', err.message)
    }
    throw err
  }
}

/**
 * Fetch campaign leads list from backend (for admin dashboard)
 * @param {Object} [options]
 * @param {string} [options.adminKey] - Optional admin authorization key if configured
 * @returns {Promise<{ success: boolean, total: number, leads: Array<Object>, data: Array<Object> }>}
 */
export async function fetchCampaignLeads(options = {}) {
  const baseUrl = getApiBaseUrl()
  const endpoint = `${baseUrl}/api/campaigns`

  const headers = {
    'Accept': 'application/json'
  }

  if (options.adminKey) {
    headers['x-admin-key'] = options.adminKey
    headers['Authorization'] = `Bearer ${options.adminKey}`
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const error = new Error(errorData?.message || `Failed to fetch campaign leads (HTTP ${response.status})`)
      error.status = response.status
      error.details = errorData
      throw error
    }

    const data = await response.json()
    const leadsList = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.leads) ? data.leads : [])
    
    return {
      success: Boolean(data?.success),
      total: typeof data?.total === 'number' ? data.total : leadsList.length,
      leads: leadsList,
      data: leadsList
    }
  } catch (err) {
    if (typeof import.meta !== 'undefined' && !import.meta.env?.PROD) {
      console.error('[campaignApi] fetchCampaignLeads error:', err.message)
    }
    throw err
  }
}

/**
 * Check backend health status with timeout protection
 * @param {Object} [options]
 * @param {number} [options.timeoutMs=5000] - Request timeout in milliseconds
 * @returns {Promise<{ status: string, service?: string, uptime?: number, timestamp?: string }>}
 */
export async function checkHealth(options = {}) {
  const baseUrl = getApiBaseUrl()
  const endpoint = `${baseUrl}/api/health`
  const timeoutMs = options.timeoutMs || 5000

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = new Error(`Health check failed with status ${response.status}`)
      error.status = response.status
      throw error
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Backend health check timed out after ${timeoutMs}ms`)
      timeoutError.status = 408
      throw timeoutError
    }
    throw err
  }
}
