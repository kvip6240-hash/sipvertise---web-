/**
 * Sipvertise Admin Campaign Leads & Backend Health Component
 */
import { fetchCampaignLeads, checkHealth } from '../services/campaignApi.js'

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoString
  }
}

/**
 * Initializes the health check indicator in the DOM
 * @param {HTMLElement} element
 */
export async function initHealthCheckIndicator(element) {
  if (!element) return

  const dot = element.querySelector('.health-dot')
  const label = element.querySelector('.health-label')

  try {
    const health = await checkHealth({ timeoutMs: 4000 })
    if (health && health.status === 'OK') {
      if (dot) {
        dot.className = 'health-dot health-online'
      }
      if (label) {
        label.textContent = 'API Online'
        element.title = `Backend online · Uptime: ${Math.round(health.uptime || 0)}s`
      }
    } else {
      if (dot) dot.className = 'health-dot health-warning'
      if (label) label.textContent = 'API Degraded'
    }
  } catch (err) {
    if (dot) dot.className = 'health-dot health-offline'
    if (label) {
      label.textContent = 'API Offline'
      element.title = `Backend connection error: ${err.message}`
    }
  }
}

/**
 * Initializes the Admin Leads Modal and triggers
 */
export function initAdminDashboard() {
  // Prevent duplicate initialization
  if (document.getElementById('admin-leads-modal')) return

  // Create Modal Container
  const modal = document.createElement('div')
  modal.id = 'admin-leads-modal'
  modal.className = 'admin-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('aria-labelledby', 'admin-modal-title')
  modal.style.display = 'none'

  modal.innerHTML = `
    <div class="admin-modal-backdrop" id="admin-modal-backdrop"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <div class="admin-header-title-wrap">
          <p class="admin-eyebrow">[ ADMIN DASHBOARD ]</p>
          <h2 id="admin-modal-title">Campaign Inquiries &amp; Leads</h2>
        </div>
        <div class="admin-header-actions">
          <button type="button" class="admin-refresh-btn" id="admin-refresh-btn" aria-label="Refresh campaign leads">
            <span class="refresh-icon">↻</span> Refresh
          </button>
          <button type="button" class="admin-close-btn" id="admin-close-btn" aria-label="Close dashboard">✕</button>
        </div>
      </div>

      <div class="admin-status-bar" id="admin-status-bar">
        <div class="admin-status-item">
          <span class="admin-status-dot" id="admin-health-dot"></span>
          <span id="admin-health-text">Checking backend status...</span>
        </div>
        <div class="admin-status-item" id="admin-leads-count-wrap">
          <span>Total Leads: <strong id="admin-total-leads">—</strong></span>
        </div>
      </div>

      <div class="admin-modal-body" id="admin-modal-body">
        <div class="admin-loading-state">
          <div class="admin-spinner"></div>
          <p>Loading real-time campaign leads from backend...</p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const bodyEl = modal.querySelector('#admin-modal-body')
  const totalCountEl = modal.querySelector('#admin-total-leads')
  const healthDot = modal.querySelector('#admin-health-dot')
  const healthText = modal.querySelector('#admin-health-text')
  const refreshBtn = modal.querySelector('#admin-refresh-btn')
  const closeBtn = modal.querySelector('#admin-close-btn')
  const backdrop = modal.querySelector('#admin-modal-backdrop')

  let isLoading = false

  async function loadLeads() {
    if (isLoading) return
    isLoading = true

    if (refreshBtn) refreshBtn.classList.add('is-spinning')
    bodyEl.innerHTML = `
      <div class="admin-loading-state">
        <div class="admin-spinner"></div>
        <p>Fetching campaign inquiries...</p>
      </div>
    `

    // Update Health
    checkHealth({ timeoutMs: 3000 })
      .then((h) => {
        healthDot.className = 'admin-status-dot is-online'
        healthText.textContent = `API Connected (${h.service || 'Sipvertise Campaign API'})`
      })
      .catch((err) => {
        healthDot.className = 'admin-status-dot is-offline'
        healthText.textContent = `API Disconnected (${err.message})`
      })

    try {
      const response = await fetchCampaignLeads()
      const leads = Array.isArray(response.leads) ? response.leads : (Array.isArray(response.data) ? response.data : [])

      totalCountEl.textContent = String(leads.length)

      if (leads.length === 0) {
        bodyEl.innerHTML = `
          <div class="admin-empty-state">
            <div class="empty-icon">📂</div>
            <h3>No campaign inquiries yet</h3>
            <p>New inquiries submitted from the "Start a Campaign" form will appear here in real time.</p>
          </div>
        `
        return
      }

      // Render leads table / cards
      let tableHtml = `
        <div class="admin-table-container">
          <table class="admin-leads-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Brand / Company</th>
                <th>Contact</th>
                <th>Campaign Details</th>
                <th>Quantity</th>
                <th>Notifications</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
      `

      leads.forEach((lead) => {
        const leadId = lead.id || lead._id || '—'
        const dateStr = formatDate(lead.submittedAt || lead.createdAt)
        const company = lead.companyName || lead.brandName || '—'
        const contact = lead.contactPerson || lead.fullName || '—'
        const email = lead.email || '—'
        const phone = lead.phoneNumber || lead.phone || '—'
        const type = lead.campaignType || 'General'
        const qty = lead.bottleQuantity || 'Not Specified'
        const msg = lead.message || ''

        // Notifications
        const emailNotif = lead.notifications?.email
        const whatsappNotif = lead.notifications?.whatsapp

        const emailBadge = emailNotif?.success
          ? '<span class="status-badge badge-success">Email ✓</span>'
          : emailNotif?.status === 'unconfigured'
            ? '<span class="status-badge badge-neutral">Email unconfigured</span>'
            : emailNotif?.error
              ? `<span class="status-badge badge-warning" title="${escapeHtml(emailNotif.error)}">Email ⚠️</span>`
              : '<span class="status-badge badge-neutral">Email —</span>'

        const waBadge = whatsappNotif?.success
          ? '<span class="status-badge badge-success">WA ✓</span>'
          : whatsappNotif?.status === 'unconfigured'
            ? '<span class="status-badge badge-neutral">WA Ready</span>'
            : '<span class="status-badge badge-neutral">WA —</span>'

        const directWaUrl = lead.notifications?.whatsapp?.directUrl || lead.whatsappDirectUrl

        tableHtml += `
          <tr>
            <td class="cell-date">
              <span class="lead-date-main">${escapeHtml(dateStr)}</span>
              <span class="lead-ref-id"><code>${escapeHtml(leadId)}</code></span>
            </td>
            <td class="cell-brand">
              <strong>${escapeHtml(company)}</strong>
              ${msg ? `<div class="lead-message-preview" title="${escapeHtml(msg)}">“${escapeHtml(msg)}”</div>` : ''}
            </td>
            <td class="cell-contact">
              <div class="contact-name">${escapeHtml(contact)}</div>
              <a href="mailto:${escapeHtml(email)}" class="contact-link">${escapeHtml(email)}</a>
              <a href="tel:${escapeHtml(phone)}" class="contact-link">${escapeHtml(phone)}</a>
            </td>
            <td class="cell-type">
              <span class="type-pill">${escapeHtml(type)}</span>
            </td>
            <td class="cell-qty">
              <strong>${escapeHtml(qty)}</strong>
            </td>
            <td class="cell-notifs">
              <div class="notif-badges-wrap">
                ${emailBadge}
                ${waBadge}
              </div>
            </td>
            <td class="cell-actions">
              ${directWaUrl ? `
                <a href="${escapeHtml(directWaUrl)}" target="_blank" rel="noopener noreferrer" class="admin-wa-btn" title="Open chat with lead details">
                  💬 Chat
                </a>
              ` : `
                <a href="mailto:${escapeHtml(email)}" class="admin-mail-btn" title="Send email to client">
                  ✉ Reply
                </a>
              `}
            </td>
          </tr>
        `
      })

      tableHtml += `
            </tbody>
          </table>
        </div>
      `

      bodyEl.innerHTML = tableHtml
    } catch (err) {
      totalCountEl.textContent = '!'
      bodyEl.innerHTML = `
        <div class="admin-error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to load campaign inquiries</h3>
          <p>${escapeHtml(err.message || 'Unable to fetch leads from backend server.')}</p>
          <button type="button" class="admin-retry-btn" id="admin-retry-load-btn">Retry Loading</button>
        </div>
      `
      const retryBtn = bodyEl.querySelector('#admin-retry-load-btn')
      if (retryBtn) retryBtn.addEventListener('click', loadLeads)
    } finally {
      isLoading = false
      if (refreshBtn) refreshBtn.classList.remove('is-spinning')
    }
  }

  function openModal() {
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    loadLeads()
  }

  function closeModal() {
    modal.style.display = 'none'
    document.body.style.overflow = ''
  }

  // Event Listeners
  closeBtn.addEventListener('click', closeModal)
  backdrop.addEventListener('click', closeModal)
  refreshBtn.addEventListener('click', loadLeads)

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal()
    }
  })

  // Attach trigger to any link or button with data-admin-trigger or id open-admin-leads-btn
  document.querySelectorAll('[data-admin-trigger], #open-admin-leads-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      openModal()
    })
  })
}
