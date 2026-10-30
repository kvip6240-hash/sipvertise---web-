import { fetchCampaignOptions, submitCampaign } from '../services/campaignApi.js'

/**
 * Escapes unsafe characters for HTML output
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Validates email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validates phone number (7 to 15 digits)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Initialize the Start a Campaign form and dynamic dropdowns
 * @param {HTMLFormElement} form
 */
export function initCampaignForm(form) {
  if (!form) return

  const campaignTypeSelect = form.querySelector('select[name="campaign_type"]')
  const quantitySelect = form.querySelector('select[name="quantity"]')
  const submitBtn = form.querySelector('button[type="submit"]')
  const statusEl = form.querySelector('.form-status')

  let isSubmitting = false

  // 1. Fetch & populate dynamic options from backend API
  async function loadOptions() {
    if (!campaignTypeSelect || !quantitySelect) return

    // Show loading state
    campaignTypeSelect.disabled = true
    quantitySelect.disabled = true
    campaignTypeSelect.innerHTML = '<option value="">Loading campaign types...</option>'
    quantitySelect.innerHTML = '<option value="">Loading quantities...</option>'

    try {
      const options = await fetchCampaignOptions()

      // Populate campaign types dynamically
      campaignTypeSelect.innerHTML = '<option value="">Select campaign type</option>'
      if (Array.isArray(options.campaignTypes) && options.campaignTypes.length > 0) {
        options.campaignTypes.forEach((type) => {
          const opt = document.createElement('option')
          opt.value = type
          opt.textContent = type
          campaignTypeSelect.appendChild(opt)
        })
      }

      // Populate bottle quantities dynamically
      quantitySelect.innerHTML = '<option value="">Select quantity</option>'
      if (Array.isArray(options.bottleQuantities) && options.bottleQuantities.length > 0) {
        options.bottleQuantities.forEach((qty) => {
          const opt = document.createElement('option')
          opt.value = qty
          opt.textContent = qty
          quantitySelect.appendChild(opt)
        })
      }
    } catch (err) {
      // Graceful error fallback if backend is momentarily unreachable
      campaignTypeSelect.innerHTML = '<option value="">Select campaign type (offline mode)</option>'
      quantitySelect.innerHTML = '<option value="">Select quantity (offline mode)</option>'

      const fallbackTypes = [
        'Event / Conference',
        'Campus / College',
        'Gym & Fitness',
        'Corporate Workplace',
        'Exhibition / Trade Show',
        'Hyperlocal Awareness',
        'Other'
      ]
      const fallbackQuantities = [
        '1,000 - 5,000',
        '5,000 - 25,000',
        '25,000 - 100,000',
        '100,000+'
      ]

      fallbackTypes.forEach((t) => {
        const opt = document.createElement('option')
        opt.value = t
        opt.textContent = t
        campaignTypeSelect.appendChild(opt)
      })

      fallbackQuantities.forEach((q) => {
        const opt = document.createElement('option')
        opt.value = q
        opt.textContent = q
        quantitySelect.appendChild(opt)
      })

      if (typeof import.meta !== 'undefined' && !import.meta.env?.PROD) {
        console.warn('Could not load campaign options dynamically; using standard fallback options.', err)
      }
    } finally {
      campaignTypeSelect.disabled = false
      quantitySelect.disabled = false
    }
  }

  // Load dropdown options immediately
  loadOptions()

  // 2. Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting) return

    const companyInput = form.querySelector('input[name="company"]')
    const contactInput = form.querySelector('input[name="contact_person"]')
    const emailInput = form.querySelector('input[name="email"]')
    const phoneInput = form.querySelector('input[name="phone"]')
    const typeSelect = form.querySelector('select[name="campaign_type"]')
    const quantitySelectEl = form.querySelector('select[name="quantity"]')
    const messageInput = form.querySelector('textarea[name="message"]')

    const companyName = companyInput?.value?.trim() || ''
    const contactPerson = contactInput?.value?.trim() || ''
    const email = emailInput?.value?.trim() || ''
    const phoneNumber = phoneInput?.value?.trim() || ''
    const campaignType = typeSelect?.value || ''
    const bottleQuantity = quantitySelectEl?.value || ''
    const message = messageInput?.value?.trim() || ''

    // Client-side validation
    const clientErrors = []
    let firstInvalidField = null

    if (!companyName) {
      clientErrors.push('Company / Brand Name is required.')
      if (!firstInvalidField) firstInvalidField = companyInput
    }

    if (!contactPerson) {
      clientErrors.push('Contact Person name is required.')
      if (!firstInvalidField) firstInvalidField = contactInput
    }

    if (!email) {
      clientErrors.push('Email address is required.')
      if (!firstInvalidField) firstInvalidField = emailInput
    } else if (!isValidEmail(email)) {
      clientErrors.push('Please enter a valid email address (e.g. name@company.com).')
      if (!firstInvalidField) firstInvalidField = emailInput
    }

    if (!phoneNumber) {
      clientErrors.push('Phone number is required.')
      if (!firstInvalidField) firstInvalidField = phoneInput
    } else if (!isValidPhone(phoneNumber)) {
      clientErrors.push('Please enter a valid phone number (7 to 15 digits).')
      if (!firstInvalidField) firstInvalidField = phoneInput
    }

    if (clientErrors.length > 0) {
      if (statusEl) {
        statusEl.className = 'form-status is-error'
        statusEl.innerHTML = `
          <strong>Please complete the required fields:</strong>
          <ul class="error-list">
            ${clientErrors.map(err => `<li>${escapeHtml(err)}</li>`).join('')}
          </ul>
        `
      }
      if (firstInvalidField) {
        firstInvalidField.focus()
      }
      return
    }

    // Set loading indicator and prevent duplicate submissions
    isSubmitting = true
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'STARTING CAMPAIGN...'
    }

    if (statusEl) {
      statusEl.className = 'form-status is-loading'
      statusEl.textContent = 'Submitting campaign brief...'
    }

    const payload = {
      companyName,
      contactPerson,
      email,
      phoneNumber,
      campaignType: campaignType || undefined,
      bottleQuantity: bottleQuantity || undefined,
      message: message || undefined
    }

    try {
      const response = await submitCampaign(payload)

      if (response && response.success) {
        // Reset form inputs only on success
        form.reset()
        form.classList.add('is-submitted')

        const isDuplicate = response.duplicate === true
        const mainMessage = response.message || (isDuplicate 
          ? 'Your campaign inquiry was already received! Our team is currently reviewing it.' 
          : 'Thanks! Your campaign request has been received.')

        let statusHtml = `<strong>${escapeHtml(mainMessage)}</strong>`

        // Display lead ID if present
        if (response.leadId) {
          statusHtml += `<div class="form-status-lead">Lead Reference: <code>${escapeHtml(response.leadId)}</code></div>`
        }

        // Notification feedback: verify actual outcomes returned by backend
        const emailNotif = response.notifications?.email
        const whatsappNotif = response.notifications?.whatsapp

        const customerEmailSuccess = emailNotif?.customerEmail?.success || emailNotif?.customer?.success || (emailNotif?.success === true)
        const adminEmailSuccess = emailNotif?.adminEmail?.success || emailNotif?.admin?.success

        if (customerEmailSuccess) {
          statusHtml += '<div class="form-status-sub">✓ Confirmation email sent.</div>'
        } else if (adminEmailSuccess) {
          statusHtml += '<div class="form-status-sub">✓ Inquiry logged with notifications team.</div>'
        }

        if (whatsappNotif && whatsappNotif.success === true) {
          statusHtml += '<div class="form-status-sub">✓ WhatsApp alert sent.</div>'
        }

        // Direct WhatsApp URL action link if returned by backend
        const directUrl = response.whatsappDirectUrl || whatsappNotif?.directUrl
        if (directUrl) {
          statusHtml += `
            <div class="whatsapp-direct-container">
              <a href="${escapeHtml(directUrl)}" target="_blank" rel="noopener noreferrer" class="whatsapp-direct-link" id="wa-lead-direct-link">
                <span>💬</span> Connect directly on WhatsApp ↗
              </a>
            </div>
          `
        }

        if (statusEl) {
          statusEl.className = 'form-status is-success'
          statusEl.innerHTML = statusHtml
        }
      } else {
        throw new Error(response?.message || 'Submission failed. Please check your information.')
      }
    } catch (err) {
      // Retain form inputs on failure so user doesn't lose their data
      if (statusEl) {
        statusEl.className = 'form-status is-error'

        if (err.status === 400) {
          if (Array.isArray(err.errors) && err.errors.length > 0) {
            statusEl.innerHTML = `
              <strong>${escapeHtml(err.message || 'Validation failed.')}</strong>
              <ul class="error-list">
                ${err.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
              </ul>
            `
          } else {
            statusEl.textContent = err.message || 'Validation failed. Please verify required fields.'
          }
        } else if (err.status === 500) {
          statusEl.textContent = 'Server error (HTTP 500): We encountered an issue processing your campaign. Please try again shortly or contact getsipvertise@gmail.com.'
        } else if (!err.status || err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          statusEl.textContent = 'Network error: Unable to connect to the backend server. Please verify your connection or check that the backend is running.'
        } else {
          statusEl.textContent = err.message || 'An unexpected error occurred. Please try again.'
        }
      }
    } finally {
      isSubmitting = false
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = 'START MY CAMPAIGN ↗'
      }
    }
  })
}
