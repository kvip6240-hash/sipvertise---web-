import './style.css'
import './enhancements.css'
import {
  initMockup3D,
  setBottleModel,
  setBottleTheme,
  setCustomColors,
  updateImage,
  removeLogo,
  setWrapAllSides,
  toggleAutoRotate,
  resetView,
  takeScreenshot,
  loadSampleFullWrap,
  THEMES
} from './mockup3d.js'

document.querySelector('#studio-app').innerHTML = `
<div class="studio-page-layout">
  <!-- Top Navigation Bar -->
  <header class="studio-topbar">
    <div class="studio-topbar-left">
      <a class="studio-brand" href="/" aria-label="Sipvertise home">
        <img class="brand-logo" src="/sipvertise-logo-badge.png" alt="Sipvertise">
        <span class="studio-header-tag">3D STUDIO</span>
      </a>
      <a href="/" class="studio-back-nav">
        <span class="back-arrow">←</span>
        <span>Back to Website</span>
      </a>
    </div>

    <div class="studio-topbar-center">
      <div class="stage-status-badge">
        <span class="pulse-green"></span>
        <span>INTERACTIVE 3D PACKAGING DEMO</span>
      </div>
    </div>

    <div class="studio-topbar-right">
      <a href="/#start-campaign" class="nav-cta studio-top-cta">START A CAMPAIGN ↗</a>
    </div>
  </header>

  <!-- Split Screen Studio Workspace -->
  <div class="studio-workspace">
    <!-- Left Sidebar Customizer -->
    <aside class="studio-sidebar" aria-label="3D Bottle Customizer">
      <!-- 1. Bottle Model Selector -->
      <div class="bottle-type-group">
        <div class="studio-group-header">
          <span class="studio-group-label">01 · SELECT PACKAGING FORMAT</span>
          <span class="studio-badge-pill"><span class="badge-dot-blue">●</span> 3D MODEL</span>
        </div>
        <div class="bottle-type-selector" role="group" aria-label="Packaging format">
          <button type="button" class="bottle-type-card is-active" data-model="carton" aria-pressed="true">
            <span class="bottle-type-check">✓</span>
            <span class="bottle-type-icon">📦</span>
            <span class="bottle-type-name">Tetra Carton</span>
            <span class="bottle-type-desc">500ml · 4-Side Wrap</span>
          </button>
          <button type="button" class="bottle-type-card" data-model="bottle" aria-pressed="false">
            <span class="bottle-type-check">✓</span>
            <span class="bottle-type-icon">
              <svg width="22" height="26" viewBox="0 0 24 30" fill="none" style="display:inline-block; vertical-align:middle;">
                <!-- Cap -->
                <rect x="8.5" y="1" width="7" height="4.5" rx="1.5" fill="#0e66ea" stroke="#0e66ea" stroke-width="0.5"/>
                <!-- Neck -->
                <path d="M9 5.5 H15 V8.5 L17.5 11.5 H6.5 L9 8.5 Z" fill="rgba(255,255,255,0.7)"/>
                <!-- Bottle Body -->
                <rect x="6" y="11.5" width="12" height="15.5" rx="2.5" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.6"/>
                <!-- Label band -->
                <rect x="6.5" y="15" width="11" height="8.5" fill="#f7c61a" rx="1"/>
                <!-- Water shine -->
                <line x1="8" y1="12" x2="8" y2="26" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
              </svg>
            </span>
            <span class="bottle-type-name">Water Bottle</span>
            <span class="bottle-type-desc">500ml · Clear PET</span>
          </button>
        </div>
      </div>

      <!-- 2. Sample Campaigns -->
      <div class="studio-samples-group">
        <div class="studio-group-header">
          <span class="studio-group-label">02 · PRE-LOADED CAMPAIGNS</span>
        </div>
        <div class="studio-sample-row">
          <button type="button" class="studio-pill-btn is-active" data-sample="sipvertise">✦ Sipvertise</button>
          <button type="button" class="studio-pill-btn" data-sample="coffee">☕ Coffee</button>
          <button type="button" class="studio-pill-btn" data-sample="resort">🌴 Resort</button>
        </div>
      </div>

      <!-- 3. Upload Artwork & View Controls (Side-by-Side Compact) -->
      <div class="studio-upload-section">
        <div class="studio-group-header">
          <span class="studio-group-label">03 · UPLOAD &amp; CONTROLS</span>
        </div>
        <div class="studio-upload-ctrl-row">
          <div class="studio-upload-box studio-box-compact" id="upload-box" tabindex="0" role="button" aria-label="Upload artwork">
            <input type="file" id="artwork-input" accept="image/png, image/jpeg, image/webp, image/svg+xml">
            <div class="upload-icon-tray">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p class="upload-title">Drop Design</p>
            <p class="upload-subtitle">PNG, JPG, SVG</p>
          </div>

          <button type="button" class="studio-action-card studio-box-compact secondary" id="btn-reset-view" title="Reset 3D camera to default front angle">
            <div class="card-icon-tray">
              <span class="card-icon">↺</span>
            </div>
            <p class="card-title">Reset View</p>
            <p class="card-subtitle">Default Angle</p>
          </button>
        </div>
      </div>

      <!-- 6. Bottom CTA Card -->
      <div class="studio-sidebar-footer">
        <p class="sidebar-cta-lead">Ready to bring this to life?</p>
        <a href="/#start-campaign" class="studio-primary-cta">START A CAMPAIGN ↗</a>
      </div>
    </aside>

    <!-- Right Main 3D Stage -->
    <main class="studio-stage" aria-label="3D Mockup Stage">
      <div class="stage-topbar">
        <div class="stage-info-pill">
          <span class="pulse-dot"></span>
          <span id="current-model-label">Tetra Carton · 500ml Gable Top</span>
        </div>
        <div class="stage-ctrl-buttons">
          <button type="button" class="stage-pill-btn" id="stage-spin-btn">
            <span>⟳ Auto Spin</span>
          </button>
          <button type="button" class="stage-pill-btn" id="stage-reset-btn">
            <span>↺ Reset</span>
          </button>
        </div>
      </div>

      <!-- Canvas Mount Container -->
      <div id="mockup-viewport" class="studio-canvas-wrap"></div>

      <!-- Interactive 3D Orbit Helper Hint -->
      <div class="stage-bottom-hint">
        <span>✦ Drag to rotate 360° · Pinch or Scroll to zoom</span>
      </div>
    </main>
  </div>
</div>
`

// -------------------------------------------------------------
// Initialize 3D Engine
// -------------------------------------------------------------
const container = document.getElementById('mockup-viewport')
let isAutoRotating = true

const studioInstance = initMockup3D(container)

// -------------------------------------------------------------
// Packaging Format Model Selector (Tetra Carton vs Water Bottle)
// -------------------------------------------------------------
const modelButtons = document.querySelectorAll('.bottle-type-card')
const modelLabel = document.getElementById('current-model-label')

modelButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const model = btn.dataset.model
    if (!model) return

    modelButtons.forEach(b => {
      b.classList.remove('is-active')
      b.setAttribute('aria-pressed', 'false')
    })
    btn.classList.add('is-active')
    btn.setAttribute('aria-pressed', 'true')
    btn.classList.add('bottle-type-card--switching')
    setTimeout(() => btn.classList.remove('bottle-type-card--switching'), 350)

    setBottleModel(model)

    if (modelLabel) {
      modelLabel.textContent = model === 'carton'
        ? 'Tetra Carton · 500ml Gable Top'
        : 'Water Bottle · 500ml Clear PET'
    }
  })
})

// -------------------------------------------------------------
// Pre-loaded Sample Campaigns
// -------------------------------------------------------------
const sampleButtons = document.querySelectorAll('[data-sample]')
sampleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sampleButtons.forEach(b => b.classList.remove('is-active'))
    btn.classList.add('is-active')
    const sample = btn.dataset.sample
    // Reset upload box UI when switching to a pre-loaded sample
    if (fileInput) fileInput.value = ''
    if (uploadBox) {
      uploadBox.classList.remove('has-file')
      uploadBox.removeAttribute('title')
      const uploadTitle = uploadBox.querySelector('.upload-title')
      if (uploadTitle) uploadTitle.textContent = 'Drop Design'
      const uploadSubtitle = uploadBox.querySelector('.upload-subtitle')
      if (uploadSubtitle) uploadSubtitle.textContent = 'PNG, JPG, SVG'
    }
    loadSampleFullWrap(sample)
  })
})

// -------------------------------------------------------------
// Artwork File Upload & Dropzone
// -------------------------------------------------------------
const uploadBox = document.getElementById('upload-box')
const fileInput = document.getElementById('artwork-input')

uploadBox.addEventListener('click', () => fileInput.click())

uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadBox.classList.add('is-dragover')
})

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('is-dragover')
})

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadBox.classList.remove('is-dragover')
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileUpload(e.dataTransfer.files[0])
  }
})

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFileUpload(e.target.files[0])
  }
})

function handleFileUpload(file) {
  const uploadTitle = uploadBox.querySelector('.upload-title')
  const uploadSubtitle = uploadBox.querySelector('.upload-subtitle')
  const name = file.name || 'custom-design.png'

  let cleanName = name
  if (cleanName.length > 16) {
    const lastDot = cleanName.lastIndexOf('.')
    const ext = lastDot > 0 ? cleanName.slice(lastDot) : ''
    const base = lastDot > 0 ? cleanName.slice(0, lastDot) : cleanName
    cleanName = base.slice(0, 10) + '..' + ext
  }

  if (uploadTitle) uploadTitle.textContent = cleanName
  if (uploadSubtitle) uploadSubtitle.textContent = 'Design Applied'
  uploadBox.title = `${name} — Click to replace`
  uploadBox.classList.add('has-file')
  sampleButtons.forEach(b => b.classList.remove('is-active'))
  updateImage(file)
}

// -------------------------------------------------------------
// Auto-Spin & Reset View (Full Initial Reset)
// -------------------------------------------------------------
const spinButtons = [document.getElementById('stage-spin-btn')]
const resetButtons = [document.getElementById('btn-reset-view'), document.getElementById('stage-reset-btn')]

spinButtons.forEach(btn => {
  if (!btn) return
  btn.addEventListener('click', () => {
    isAutoRotating = !isAutoRotating
    toggleAutoRotate(isAutoRotating)
    btn.classList.toggle('is-active', isAutoRotating)
    btn.querySelector('span').textContent = isAutoRotating ? '⟳ Auto Spin: ON' : '⟳ Auto Spin: OFF'
  })
})

function resetAllStudioState() {
  // 1. Reset 3D camera to default front angle
  resetView()

  // 2. Stop auto-spin if active
  isAutoRotating = false
  toggleAutoRotate(false)
  spinButtons.forEach(btn => {
    if (!btn) return
    btn.classList.remove('is-active')
    const spinText = btn.querySelector('span')
    if (spinText) spinText.textContent = '⟳ Auto Spin: OFF'
  })

  // 3. Clear file upload & reset upload box UI back to initial state
  if (fileInput) fileInput.value = ''
  if (uploadBox) {
    uploadBox.classList.remove('has-file')
    uploadBox.removeAttribute('title')
    const uploadTitle = uploadBox.querySelector('.upload-title')
    if (uploadTitle) uploadTitle.textContent = 'Drop Design'
    const uploadSubtitle = uploadBox.querySelector('.upload-subtitle')
    if (uploadSubtitle) uploadSubtitle.textContent = 'PNG, JPG, SVG'
  }

  // 4. Remove uploaded artwork & restore default Sipvertise packaging preset
  removeLogo()
  loadSampleFullWrap('sipvertise')
  sampleButtons.forEach(b => {
    b.classList.toggle('is-active', b.dataset.sample === 'sipvertise')
  })

}

resetButtons.forEach(btn => {
  if (!btn) return
  btn.addEventListener('click', () => resetAllStudioState())
})
