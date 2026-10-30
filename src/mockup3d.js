/**
 * mockup3d.js — Interactive 3D Water Bottle / Carton Mockup Studio
 * Sipvertise · Powered by Three.js
 * 360° Interactive Rotation · Full-Wrap 4-Side Artwork · Dynamic Brand Colors · Realistic Carton & Cap
 */

import * as THREE from 'three'

// Dimensions matching real Sipvertise Tetra carton
const CARTON_W = 1.08
const CARTON_H = 2.45
const CARTON_D = 1.08
const TEX_W = 1024
const TEX_H = 2048

// Curated Theme Presets
export const THEMES = {
  navy: {
    id: 'navy',
    name: 'Signature Navy & Gold',
    bgDark: '#0a1628',
    bgMid: '#12233f',
    accent: '#f7c61a',
    waveCream: '#f5f0e6',
    waveDark: '#0a1628',
    capColor: '#fcfbfa'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Black & Gold',
    bgDark: '#0d0d12',
    bgMid: '#1a1922',
    accent: '#e5b842',
    waveCream: '#eae5d8',
    waveDark: '#0d0d12',
    capColor: '#201f28'
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Velvet & Ruby',
    bgDark: '#20080d',
    bgMid: '#381219',
    accent: '#ff334b',
    waveCream: '#fbeff1',
    waveDark: '#20080d',
    capColor: '#ffffff'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest & Mint',
    bgDark: '#061a12',
    bgMid: '#0e2e21',
    accent: '#10b981',
    waveCream: '#edf9f3',
    waveDark: '#061a12',
    capColor: '#ffffff'
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan & Deep Ocean',
    bgDark: '#061426',
    bgMid: '#0a2647',
    accent: '#00d2ff',
    waveCream: '#edf8fc',
    waveDark: '#061426',
    capColor: '#ffffff'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Purple & Violet',
    bgDark: '#180a26',
    bgMid: '#2d1445',
    accent: '#bd34fe',
    waveCream: '#f7effc',
    waveDark: '#180a26',
    capColor: '#ffffff'
  }
}

// Global state
let currentTheme = { ...THEMES.navy }
let autoColorMatch = true
let studioMode = 'full-wrap' // 'full-wrap' or 'logo'
let wrapAllSides = true
let campaignFrame = 'bleed' // 100% full cover
let brandHeaderText = 'PREMIUM WATER CARTON'
let brandFooterText = '05 SIPVERTISE · IN EVERY HAND'
let brandContactText = '+91 8281936307 · getsipvertise@gmail.com'
let currentActiveSample = 'coffee'
let bottleModel = 'carton' // 'carton' or 'bottle'

let scene, camera, renderer, cartonGroup, animFrameId
let isDragging = false
let autoRotate = true
let prevMouseX = 0, prevMouseY = 0
let targetRotY = 0.52, targetRotX = 0.08
let currentRotY = 0.52, currentRotX = 0.08
let targetZoom = 5.0, currentZoom = 5.0
let idleTimer = null

// Round Bottle geometry constants
const BOTTLE_R = 0.48      // outer radius
const BOTTLE_H = 2.65      // total height
const BOTTLE_TEX_W = 2048
const BOTTLE_TEX_H = 1024
let cylinderCanvas, cylinderCtx, cylinderTexture

// Three.js Meshes & Materials
let capMesh = null
let capCollar = null
let rimLight = null
let kickerLight = null

// Dynamic face canvases & textures for all 4 sides:
// Front (+Z), Right (+X), Left (-X), Back (-Z)
let frontCanvas, frontCtx, frontTexture
let rightCanvas, rightCtx, rightTexture
let leftCanvas, leftCtx, leftTexture
let backCanvas, backCtx, backTexture
let topCanvas, topCtx, topTexture

// Pre-load authentic Aura Artisan Coffee campaign artwork
let coffeeArtworkImg = null
function loadCoffeeArtwork() {
  if (coffeeArtworkImg && coffeeArtworkImg.complete) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    coffeeArtworkImg = img
    if (currentActiveSample === 'coffee' && !uploadedImage) {
      refreshTextures()
    }
  }
  img.src = '/sample-coffee-aura.jpg'
}
loadCoffeeArtwork()

let uploadedImage = null
let logoParams = {
  size: 42,
  opacity: 1.0,
  position: 'center'
}

let onThemeChangeCallback = null

/**
 * Initialize 3D Bottle Mockup in the given container DOM element
 */
export function initMockup3D(container, options = {}) {
  if (!container) return null

  if (options.onThemeChange) {
    onThemeChangeCallback = options.onThemeChange
  }

  container.innerHTML = ''
  const w = container.clientWidth || 520
  const h = container.clientHeight || 600

  // 1. Scene setup
  scene = new THREE.Scene()
  scene.background = null

  // 2. Camera setup
  camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100)
  camera.position.set(0, 0.2, currentZoom)

  // 3. Renderer with antialiasing & physical lighting
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.cursor = 'grab'
  container.appendChild(renderer.domElement)

  // 4. Lighting setup
  setupLights()

  // 5. Build dynamic textures for all 4 sides
  buildAllCartonTextures()
  buildCylinderTexture()

  // 6. Build 3D carton mesh with cap & details
  build3DCarton()

  // 7. Ground soft contact shadow
  createSoftShadowFloor()

  // 8. Event listeners for 360° mouse & touch interaction
  bindEvents(container)

  // 9. Resize observer
  const ro = new ResizeObserver(() => onResize(container))
  ro.observe(container)

  // 10. Load default artisan coffee ad sample matching exact design
  loadSampleFullWrap('sipvertise')

  // 11. Start loop
  scheduleAutoRotate()
  animate()

  return {
    updateLogo: updateImage,
    updateImage,
    setLogoParams,
    removeLogo,
    toggleAutoRotate,
    resetView,
    takeScreenshot,
    loadSampleLogo,
    loadSampleFullWrap,
    setBottleTheme,
    setCustomColors,
    toggleAutoColorMatch,
    setStudioMode,
    setWrapAllSides,
    setCampaignFrame,
    setCustomTexts,
    setBottleModel,
    getCurrentTheme: () => currentTheme,
    getStudioMode: () => studioMode,
    getBottleModel: () => bottleModel,
    destroy: () => destroyMockup(container, ro)
  }
}

/**
 * Lighting rig designed for product photography
 */
function setupLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4)
  keyLight.position.set(-3.2, 5.5, 4.2)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 16
  keyLight.shadow.camera.left = -3
  keyLight.shadow.camera.right = 3
  keyLight.shadow.camera.top = 3.5
  keyLight.shadow.camera.bottom = -3.5
  keyLight.shadow.bias = -0.0008
  keyLight.shadow.radius = 3.5
  scene.add(keyLight)

  rimLight = new THREE.DirectionalLight(0x99c2ff, 1.4)
  rimLight.position.set(3.8, 3.0, -3.2)
  scene.add(rimLight)

  kickerLight = new THREE.DirectionalLight(0xffdf88, 0.7)
  kickerLight.position.set(2.8, -1.5, 3.0)
  scene.add(kickerLight)

  const topSpot = new THREE.SpotLight(0xffffff, 1.2, 8, Math.PI / 4, 0.4)
  topSpot.position.set(0, 4.5, 0.8)
  scene.add(topSpot)
}

/**
 * Creates soft floor shadow under carton
 */
function createSoftShadowFloor() {
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = 512
  shadowCanvas.height = 512
  const sCtx = shadowCanvas.getContext('2d')

  const grad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 240)
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)')
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.38)')
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  sCtx.fillStyle = grad
  sCtx.fillRect(0, 0, 512, 512)

  const shadowTex = new THREE.CanvasTexture(shadowCanvas)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    })
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = -CARTON_H / 2 - 0.02
  scene.add(shadowPlane)
}

/**
 * Builds separate canvas textures for each of the 4 vertical faces + top face
 */
function buildAllCartonTextures() {
  const initFace = (w = TEX_W, h = TEX_H) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { c, ctx, tex }
  }

  const f = initFace(); frontCanvas = f.c; frontCtx = f.ctx; frontTexture = f.tex
  const r = initFace(); rightCanvas = r.c; rightCtx = r.ctx; rightTexture = r.tex
  const l = initFace(); leftCanvas = l.c; leftCtx = l.ctx; leftTexture = l.tex
  const b = initFace(); backCanvas = b.c; backCtx = b.ctx; backTexture = b.tex
  const t = initFace(512, 512); topCanvas = t.c; topCtx = t.ctx; topTexture = t.tex

  redrawAllFaces()
}

/**
 * Renders the Signature Sipvertise Water Carton design with dynamic orange liquid splash,
 * navy waves, yellow sun circle and sky blue gable matching user's photo
 */
/**
 * Renders the Authentic Sipvertise Water Carton design matching user reference photo 1:1:
 * - Clean cream/ivory folded gable roof slope
 * - Deep rich Navy Blue carton body (#0a1936 to #0d234d)
 * - Bright cyan Sipvertise logo header
 * - Tagline "Stay branded in when you can stand out."
 * - Bold stacked typography: PLACE (white) YOUR (yellow) AD (white) HERE (yellow)
 * - Large golden yellow sun circle on the right edge
 * - Seamless flowing cream waves & navy ribbon wrapping all 4 sides
 * - Bottom tagline & eco droplet QR badge
 */
function drawSipvertiseCartonFace(ctx, face) {
  const W = TEX_W
  const H = TEX_H
  ctx.clearRect(0, 0, W, H)

  // 1. Folded Gable Roof Slope (Top Y = 0 to 470)
  const roofGrad = ctx.createLinearGradient(0, 0, 0, 470)
  roofGrad.addColorStop(0, '#faf7f0')
  roofGrad.addColorStop(0.5, '#f4eee0')
  roofGrad.addColorStop(1, '#ebe4d3')
  ctx.fillStyle = roofGrad
  ctx.fillRect(0, 0, W, 470)

  // Gable shoulder fold crease line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 470)
  ctx.lineTo(W, 470)
  ctx.stroke()

  // 2. Main Body: Deep Rich Navy Blue Background (Y = 470 to H)
  const navyBg = ctx.createLinearGradient(0, 470, 0, H)
  navyBg.addColorStop(0, '#0a1936')
  navyBg.addColorStop(0.35, '#0d234d')
  navyBg.addColorStop(0.75, '#0b1d42')
  navyBg.addColorStop(1, '#07132b')
  ctx.fillStyle = navyBg
  ctx.fillRect(0, 470, W, H - 470)

  // Subtle paper texture sheen
  const sheen = ctx.createLinearGradient(0, 470, W, 470)
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.04)')
  sheen.addColorStop(0.2, 'rgba(255, 255, 255, 0.07)')
  sheen.addColorStop(0.8, 'rgba(255, 255, 255, 0.02)')
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.08)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 470, W, H - 470)

  // Colors
  const creamWaveColor = '#f4eee1'
  const navyRibbonColor = '#0b1f46'

  if (face === 'front') {
    // ── FRONT FACE ──────────────────────────────────────────────────────────

    // 1. Header: Sipvertise in bright cyan
    ctx.save()
    ctx.textAlign = 'left'
    ctx.font = '800 68px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00a8ff'
    ctx.letterSpacing = '1px'
    ctx.fillText('Sipvertise', 120, 560)

    // Tagline in clean white
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
    ctx.letterSpacing = '0.5px'
    ctx.fillText('Stay branded in', 120, 622)
    ctx.fillText('when you can', 120, 660)
    ctx.fillText('stand out.', 120, 698)
    ctx.restore()

    // 2. Large Golden Yellow Sun Circle on Right Edge
    ctx.save()
    ctx.beginPath()
    ctx.arc(W * 0.98, 865, 275, 0, Math.PI * 2)
    ctx.fillStyle = '#f7be00'
    ctx.fill()
    ctx.restore()

    // 3. Bold Billboard Stacked Typography
    ctx.save()
    ctx.textAlign = 'left'
    const textX = 120
    const fSize = 106
    ctx.font = `900 ${fSize}px "Plus Jakarta Sans", sans-serif`
    ctx.letterSpacing = '3px'

    // PLACE (White)
    ctx.fillStyle = '#ffffff'
    ctx.fillText('PLACE', textX, 830)

    // YOUR (Golden Yellow)
    ctx.fillStyle = '#f7be00'
    ctx.fillText('YOUR', textX, 942)

    // AD (White)
    ctx.fillStyle = '#ffffff'
    ctx.fillText('AD', textX, 1054)

    // HERE (Golden Yellow)
    ctx.fillStyle = '#f7be00'
    ctx.fillText('HERE', textX, 1166)
    ctx.restore()

    // 4. Flowing Cream & Navy Wave Graphic across lower half
    ctx.save()
    ctx.fillStyle = creamWaveColor
    ctx.beginPath()
    ctx.moveTo(0, 1190)
    ctx.bezierCurveTo(W * 0.35, 1260, W * 0.65, 1370, W, 1320)
    ctx.lineTo(W, 1720)
    ctx.bezierCurveTo(W * 0.65, 1760, W * 0.35, 1660, 0, 1710)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = navyRibbonColor
    ctx.beginPath()
    ctx.moveTo(0, 1370)
    ctx.bezierCurveTo(W * 0.35, 1440, W * 0.65, 1540, W, 1490)
    ctx.lineTo(W, 1585)
    ctx.bezierCurveTo(W * 0.65, 1635, W * 0.35, 1535, 0, 1465)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // 5. Bottom slogan (Left-aligned white text)
    ctx.save()
    ctx.textAlign = 'left'
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.letterSpacing = '0.5px'
    ctx.fillText('Affordable', 120, 1800)
    ctx.fillText('Hydration with', 120, 1840)
    ctx.fillText('Influencizing', 120, 1880)
    ctx.fillText('branding solutions.', 120, 1920)

    // Bottom-right Minimal Eco QR & Droplet Badge
    const qrX = W - 220
    const qrY = 1800
    ctx.strokeStyle = creamWaveColor
    ctx.lineWidth = 4
    ctx.strokeRect(qrX, qrY, 36, 36)
    ctx.strokeRect(qrX + 46, qrY, 36, 36)
    ctx.strokeRect(qrX, qrY + 46, 36, 36)
    ctx.strokeRect(qrX + 46, qrY + 46, 36, 36)

    // Droplet icon next to QR
    const dropX = qrX + 115
    const dropY = qrY + 40
    ctx.beginPath()
    ctx.moveTo(dropX, dropY - 26)
    ctx.bezierCurveTo(dropX + 22, dropY - 5, dropX + 22, dropY + 22, dropX, dropY + 22)
    ctx.bezierCurveTo(dropX - 22, dropY + 22, dropX - 22, dropY - 5, dropX, dropY - 26)
    ctx.stroke()
    ctx.restore()

  } else if (face === 'right') {
    // ── RIGHT FACE (+X) ─────────────────────────────────────────────────────

    // 1. Continuation of Sun Circle on left edge (meets Front face at X = 0)
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 865, 275, -Math.PI * 0.5, Math.PI * 0.5)
    ctx.fillStyle = '#f7be00'
    ctx.fill()
    ctx.restore()

    // 2. Wave continuation from Front face right edge (Y = 1320, 1490)
    ctx.save()
    ctx.fillStyle = creamWaveColor
    ctx.beginPath()
    ctx.moveTo(0, 1320)
    ctx.bezierCurveTo(W * 0.35, 1270, W * 0.70, 1220, W, 1260)
    ctx.lineTo(W, 1660)
    ctx.bezierCurveTo(W * 0.70, 1620, W * 0.35, 1670, 0, 1720)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = navyRibbonColor
    ctx.beginPath()
    ctx.moveTo(0, 1490)
    ctx.bezierCurveTo(W * 0.35, 1440, W * 0.70, 1390, W, 1430)
    ctx.lineTo(W, 1525)
    ctx.bezierCurveTo(W * 0.70, 1485, W * 0.35, 1535, 0, 1585)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // 3. Side Content: 500 ML Badge & Mineral Facts
    ctx.save()
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(0, 168, 255, 0.16)'
    ctx.strokeStyle = '#00a8ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(110, 520, 180, 56, 28)
    ctx.fill()
    ctx.stroke()

    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('500 ML', 150, 558)

    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00a8ff'
    ctx.letterSpacing = '2px'
    ctx.fillText('PURE ARTISAN WATER', 110, 630)

    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fillText('NATURALLY ALKALINE pH 7.4', 110, 665)
    ctx.fillText('PLANT-BASED RENEWABLE CARTON', 110, 698)

    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = creamWaveColor
    ctx.fillText('🌱 100% Recyclable Packaging', 110, 1800)
    ctx.fillText('💧 RO & Ozonated Spring Water', 110, 1838)
    ctx.fillText('🛡️ Zero Microplastics · BPA Free', 110, 1876)
    ctx.fillText('📍 Distributed at Premium Venues', 110, 1914)
    ctx.restore()

  } else if (face === 'left') {
    // ── LEFT FACE (-X) ──────────────────────────────────────────────────────

    ctx.save()
    ctx.fillStyle = creamWaveColor
    ctx.beginPath()
    ctx.moveTo(0, 1240)
    ctx.bezierCurveTo(W * 0.35, 1290, W * 0.70, 1230, W, 1190)
    ctx.lineTo(W, 1710)
    ctx.bezierCurveTo(W * 0.70, 1750, W * 0.35, 1700, 0, 1660)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = navyRibbonColor
    ctx.beginPath()
    ctx.moveTo(0, 1420)
    ctx.bezierCurveTo(W * 0.35, 1470, W * 0.70, 1410, W, 1370)
    ctx.lineTo(W, 1465)
    ctx.bezierCurveTo(W * 0.70, 1505, W * 0.35, 1565, 0, 1515)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'left'
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00a8ff'
    ctx.letterSpacing = '1px'
    ctx.fillText('SIPVERTISE', 110, 560)

    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#f7be00'
    ctx.letterSpacing = '2px'
    ctx.fillText('IN EVERY HAND', 110, 600)

    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    const lines = [
      'High-impact offline media',
      'turning daily hydration into',
      'memorable brand impressions.',
      '',
      'Guaranteed dwell time of',
      '20+ minutes per carton.'
    ]
    lines.forEach((l, i) => ctx.fillText(l, 110, 650 + i * 36))

    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = creamWaveColor
    ctx.fillText('FSSAI LIC. NO. 11322001000452', 110, 1800)
    ctx.fillText('ISO 9001:2015 CERTIFIED', 110, 1838)
    ctx.fillText('IS:14543 CM/L-6789123', 110, 1876)
    ctx.fillText('♻️ CRUSH CARTON AFTER USE', 110, 1914)
    ctx.restore()

  } else {
    // ── BACK FACE (-Z) ──────────────────────────────────────────────────────

    ctx.save()
    ctx.fillStyle = creamWaveColor
    ctx.beginPath()
    ctx.moveTo(0, 1260)
    ctx.bezierCurveTo(W * 0.35, 1220, W * 0.70, 1270, W, 1240)
    ctx.lineTo(W, 1660)
    ctx.bezierCurveTo(W * 0.70, 1690, W * 0.35, 1640, 0, 1660)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = navyRibbonColor
    ctx.beginPath()
    ctx.moveTo(0, 1430)
    ctx.bezierCurveTo(W * 0.35, 1390, W * 0.70, 1440, W, 1420)
    ctx.lineTo(W, 1515)
    ctx.bezierCurveTo(W * 0.70, 1535, W * 0.35, 1485, 0, 1525)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00a8ff'
    ctx.fillText('Sipvertise', W / 2, 560)

    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#f7be00'
    ctx.letterSpacing = '3px'
    ctx.fillText('BE SEEN IN EVERY HAND', W / 2, 600)

    // Barcode Graphic
    const barX = W / 2 - 120
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(barX, 650, 240, 100)
    ctx.fillStyle = '#000000'
    for (let i = barX + 15; i < barX + 225; i += 6) {
      const bW = (i % 4 === 0) ? 4 : 2
      ctx.fillRect(i, 660, bW, 65)
    }
    ctx.font = '700 16px monospace'
    ctx.fillText('8 901234 567890', W / 2, 742)

    // QR Code
    ctx.fillStyle = '#ffffff'
    const bQrS = 130
    const bQrX = W / 2 - bQrS / 2
    const bQrY = 1760
    ctx.fillRect(bQrX, bQrY, bQrS, bQrS)
    ctx.fillStyle = '#000000'
    ctx.fillRect(bQrX + 12, bQrY + 12, 32, 32)
    ctx.clearRect(bQrX + 18, bQrY + 18, 20, 20)
    ctx.fillRect(bQrX + 22, bQrY + 22, 12, 12)

    ctx.fillRect(bQrX + bQrS - 44, bQrY + 12, 32, 32)
    ctx.clearRect(bQrX + bQrS - 38, bQrY + 18, 20, 20)
    ctx.fillRect(bQrX + bQrS - 34, bQrY + 22, 12, 12)

    ctx.fillRect(bQrX + 12, bQrY + bQrS - 44, 32, 32)
    ctx.clearRect(bQrX + 18, bQrY + bQrS - 38, 20, 20)
    ctx.fillRect(bQrX + 22, bQrY + bQrS - 34, 12, 12)

    for (let qy = bQrY + 12; qy < bQrY + bQrS - 12; qy += 8) {
      for (let qx = bQrX + 12; qx < bQrX + bQrS - 12; qx += 8) {
        if ((qx * 11 + qy * 7) % 5 === 0) {
          ctx.fillRect(qx, qy, 7, 7)
        }
      }
    }

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('SCAN TO ADVERTISE', W / 2, bQrY + bQrS + 30)
    ctx.font = '500 16px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText('www.sipvertise.in · +91 8281936307', W / 2, bQrY + bQrS + 55)
    ctx.restore()
  }
}

function drawCoffeeFace(ctx, face) {
  const W = TEX_W
  const H = TEX_H
  ctx.clearRect(0, 0, W, H)

  // 1. If coffee artwork is loaded and this is front or back face, draw full poster
  if (coffeeArtworkImg && (face === 'front' || face === 'back' || wrapAllSides)) {
    drawImageCover(ctx, coffeeArtworkImg, 0, 0, W, H)
    return
  }

  // 2. Coordinated luxury dark espresso side packaging face (#100e0c)
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#100e0c')
  bgGrad.addColorStop(0.5, '#1a1512')
  bgGrad.addColorStop(1, '#120f0d')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Subtle luxury gold hairline borders
  ctx.strokeStyle = 'rgba(197, 164, 103, 0.4)'
  ctx.lineWidth = 3
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.strokeStyle = 'rgba(197, 164, 103, 0.16)'
  ctx.lineWidth = 1
  ctx.strokeRect(48, 48, W - 96, H - 96)

  if (face === 'right') {
    // RIGHT FACE: Tasting Notes, Origin Profile, & QR Code
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif'
    ctx.letterSpacing = '8px'
    ctx.fillStyle = '#dfc18b'
    ctx.fillText('AURA · ARTISAN COFFEE', W / 2, 130)

    ctx.font = '700 15px "Plus Jakarta Sans", monospace'
    ctx.letterSpacing = '4px'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.fillText('BATCH NO. 0824 · SINGLE ORIGIN', W / 2, 172)

    ctx.strokeStyle = '#c5a467'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - 50, 205)
    ctx.lineTo(W / 2 + 50, 205)
    ctx.stroke()

    ctx.textAlign = 'left'
    const textX = 85
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#c5a467'
    ctx.letterSpacing = '3px'
    ctx.fillText('ORIGIN & PROCESS', textX, 290)

    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#f8f6f0'
    ctx.fillText('Yirgacheffe, Ethiopia', textX, 330)

    ctx.font = '400 17px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.fillText('Altitude: 1,950m · Natural Sun-Dried', textX, 366)

    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#c5a467'
    ctx.letterSpacing = '3px'
    ctx.fillText('CUPPING NOTES', textX, 450)

    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#f8f6f0'
    ctx.fillText('Dark Cacao · Wild Berries · Honey Bloom', textX, 490)

    ctx.font = '400 17px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fillText('Roast: Medium-Dark Espresso Profile', textX, 526)

    // Gold QR Code block
    const qrSize = 130
    const qrX = (W - qrSize) / 2
    const qrY = H - 340
    ctx.fillStyle = '#f8f6f0'
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)

    ctx.fillStyle = '#100e0c'
    ctx.fillRect(qrX, qrY, 34, 34)
    ctx.fillRect(qrX + qrSize - 34, qrY, 34, 34)
    ctx.fillRect(qrX, qrY + qrSize - 34, 34, 34)
    ctx.fillStyle = '#f8f6f0'
    ctx.fillRect(qrX + 7, qrY + 7, 20, 20)
    ctx.fillRect(qrX + qrSize - 27, qrY + 7, 20, 20)
    ctx.fillRect(qrX + 7, qrY + qrSize - 27, 20, 20)
    ctx.fillStyle = '#100e0c'
    ctx.fillRect(qrX + 12, qrY + 12, 10, 10)
    ctx.fillRect(qrX + qrSize - 22, qrY + 12, 10, 10)
    ctx.fillRect(qrX + 12, qrY + qrSize - 22, 10, 10)
    ctx.fillRect(qrX + 46, qrY + 46, 38, 38)

    ctx.textAlign = 'center'
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#dfc18b'
    ctx.letterSpacing = '3px'
    ctx.fillText('SCAN FOR BREWING GUIDE', W / 2, qrY + qrSize + 40)

    ctx.font = '500 15px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.fillText('WWW.AURACOFFEE.COM', W / 2, qrY + qrSize + 68)
    ctx.restore()
  } else if (face === 'left') {
    // LEFT FACE: Heritage & Sustainability Story
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif'
    ctx.letterSpacing = '8px'
    ctx.fillStyle = '#dfc18b'
    ctx.fillText('THE ART OF THE BREW', W / 2, 130)

    ctx.font = '700 15px "Plus Jakarta Sans", monospace'
    ctx.letterSpacing = '4px'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.fillText('500ML · COLD WATER BEVERAGE', W / 2, 172)

    ctx.strokeStyle = '#c5a467'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - 50, 205)
    ctx.lineTo(W / 2 + 50, 205)
    ctx.stroke()

    ctx.font = 'italic 400 22px "Plus Jakarta Sans", serif'
    ctx.fillStyle = '#f8f6f0'
    ctx.fillText('"Every cup begins with intentionality."', W / 2, 310)

    ctx.font = '400 17px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.fillText('Slow roasted in small batches to preserve', W / 2, 360)
    ctx.fillText('the delicate floral jasmine and dark cacao notes.', W / 2, 392)

    // Eco badge
    ctx.strokeStyle = 'rgba(197, 164, 103, 0.45)'
    ctx.lineWidth = 2
    ctx.strokeRect(80, 480, W - 160, 140)

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#dfc18b'
    ctx.letterSpacing = '2px'
    ctx.fillText('SUSTAINABLY PACKAGED', W / 2, 524)

    ctx.font = '400 15px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.fillText('Plant-based carton with 80% lower', W / 2, 560)
    ctx.fillText('carbon footprint than standard bottles.', W / 2, 586)

    // Barcode
    const barY = H - 220
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    for (let b = 90; b < W - 90; b += 8) {
      const barW = (b % 16 === 0) ? 5 : 2
      ctx.fillRect(b, barY, barW, 55)
    }

    ctx.font = '600 14px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fillText('8 901234 567890 · FSC CERTIFIED', W / 2, barY + 86)
    ctx.restore()
  } else {
    // Fallback if image hasn't finished loading yet
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '800 48px "Plus Jakarta Sans", serif'
    ctx.fillStyle = '#dfc18b'
    ctx.letterSpacing = '10px'
    ctx.fillText('AURA', W / 2, H * 0.45)
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif'
    ctx.letterSpacing = '6px'
    ctx.fillStyle = '#f8f6f0'
    ctx.fillText('ARTISAN COFFEE', W / 2, H * 0.52)
    ctx.restore()
  }
}

function drawCoffeeCylinderLabel(ctx, W, H) {
  // Rich espresso dark background with subtle radial glow
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#100e0c')
  bg.addColorStop(0.25, '#1a1613')
  bg.addColorStop(0.5, '#221d19')
  bg.addColorStop(0.75, '#1a1613')
  bg.addColorStop(1, '#100e0c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Gold accent horizontal bands
  ctx.strokeStyle = 'rgba(197, 164, 103, 0.4)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 30)
  ctx.lineTo(W, 30)
  ctx.moveTo(0, H - 30)
  ctx.lineTo(W, H - 30)
  ctx.stroke()

  // Center Front: Aura Coffee artwork
  const artW = 560
  const artH = H - 90
  const artX = (W - artW) / 2
  const artY = 45

  if (coffeeArtworkImg) {
    drawImageCover(ctx, coffeeArtworkImg, artX, artY, artW, artH)
  }

  // Gold frame around front billboard
  ctx.strokeStyle = '#c5a467'
  ctx.lineWidth = 4
  ctx.strokeRect(artX, artY, artW, artH)

  // Left side: Tasting notes
  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#dfc18b'
  ctx.letterSpacing = '6px'
  ctx.fillText('AURA · ARTISAN COFFEE', W * 0.22, H * 0.36)

  ctx.font = '400 20px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#f8f6f0'
  ctx.fillText('ETHIOPIA YIRGACHEFFE', W * 0.22, H * 0.45)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
  ctx.fillText('Dark Cacao · Ripe Berries', W * 0.22, H * 0.52)
  ctx.fillText('Roasted to Perfection', W * 0.22, H * 0.58)
  ctx.restore()

  // Right side: QR Code & URL
  ctx.save()
  const qrX = W * 0.78 - 60
  const qrY = H * 0.34
  const qrS = 120
  ctx.fillStyle = '#f8f6f0'
  ctx.fillRect(qrX - 10, qrY - 10, qrS + 20, qrS + 20)
  ctx.fillStyle = '#100e0c'
  ctx.fillRect(qrX, qrY, qrS, qrS)
  ctx.fillStyle = '#f8f6f0'
  ctx.fillRect(qrX + 8, qrY + 8, 30, 30)
  ctx.fillRect(qrX + qrS - 38, qrY + 8, 30, 30)
  ctx.fillRect(qrX + 8, qrY + qrS - 38, 30, 30)
  ctx.fillStyle = '#100e0c'
  ctx.fillRect(qrX + 16, qrY + 16, 14, 14)
  ctx.fillRect(qrX + qrS - 30, qrY + 16, 14, 14)
  ctx.fillRect(qrX + 16, qrY + 16, 14, 14)
  ctx.fillRect(qrX + 44, qrY + 44, 32, 32)

  ctx.textAlign = 'center'
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#dfc18b'
  ctx.letterSpacing = '3px'
  ctx.fillText('SCAN FOR BREWING GUIDE', W * 0.78, qrY + qrS + 38)
  ctx.font = '500 15px monospace'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.fillText('WWW.AURACOFFEE.COM', W * 0.78, qrY + qrS + 66)
  ctx.restore()
}

/**
 * Redraws all 4 vertical faces (Front, Right, Left, Back)
 */
function redrawAllFaces() {
  if (studioMode === 'full-wrap') {
    if (uploadedImage) {
      drawFullWrapFace(frontCtx, uploadedImage, 'front')
      if (wrapAllSides) {
        drawFullWrapFace(rightCtx, uploadedImage, 'right')
        drawFullWrapFace(leftCtx, uploadedImage, 'left')
        drawFullWrapFace(backCtx, uploadedImage, 'back')
      } else {
        drawSipvertiseCartonFace(rightCtx, 'right')
        drawSipvertiseCartonFace(leftCtx, 'left')
        drawSipvertiseCartonFace(backCtx, 'back')
      }
    } else if (currentActiveSample === 'coffee') {
      drawCoffeeFace(frontCtx, 'front')
      drawCoffeeFace(rightCtx, 'right')
      drawCoffeeFace(leftCtx, 'left')
      drawCoffeeFace(backCtx, 'back')
    } else {
      // Default: Official Sipvertise Carton design matching reference photo 1:1
      drawSipvertiseCartonFace(frontCtx, 'front')
      drawSipvertiseCartonFace(rightCtx, 'right')
      drawSipvertiseCartonFace(leftCtx, 'left')
      drawSipvertiseCartonFace(backCtx, 'back')
    }
  } else {
    drawSipvertiseCartonFace(frontCtx, 'front')
    drawSipvertiseCartonFace(rightCtx, 'right')
    drawSipvertiseCartonFace(leftCtx, 'left')
    drawSipvertiseCartonFace(backCtx, 'back')
  }

  drawTopFace()

  if (frontTexture) frontTexture.needsUpdate = true
  if (rightTexture) rightTexture.needsUpdate = true
  if (leftTexture) leftTexture.needsUpdate = true
  if (backTexture) backTexture.needsUpdate = true
}

/**
 * Draws the top gable carton face with realistic fold creases and matching colors
 */
function getDominantTopColor(img) {
  try {
    const c = document.createElement('canvas')
    c.width = 16
    c.height = 16
    const cx = c.getContext('2d')
    cx.drawImage(img, 0, 0, 16, 16)
    const p = cx.getImageData(8, 2, 1, 1).data
    return `rgb(${p[0]}, ${p[1]}, ${p[2]})`
  } catch (e) {
    return '#14110f'
  }
}

function drawTopFace() {
  if (!topCtx) return
  topCtx.clearRect(0, 0, 512, 512)

  if (uploadedImage) {
    topCtx.fillStyle = getDominantTopColor(uploadedImage)
    topCtx.fillRect(0, 0, 512, 512)
  } else if (currentActiveSample === 'coffee') {
    topCtx.fillStyle = '#14110f'
    topCtx.fillRect(0, 0, 512, 512)
  } else {
    const grad = topCtx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#f9f7f2')
    grad.addColorStop(1, '#e8e3d8')
    topCtx.fillStyle = grad
    topCtx.fillRect(0, 0, 512, 512)
  }

  topCtx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
  topCtx.lineWidth = 3
  topCtx.beginPath()
  topCtx.moveTo(256, 0); topCtx.lineTo(256, 512)
  topCtx.moveTo(0, 256); topCtx.lineTo(512, 256)
  topCtx.stroke()

  if (topTexture) topTexture.needsUpdate = true
}

/**
 * --------------------------------------------------------------------------
 * FULL WRAP CAMPAIGN AD RENDERER (Exactly matching user's reference photo)
 * --------------------------------------------------------------------------
 */
function drawFullWrapFace(ctx, img, face) {
  const W = TEX_W
  const H = TEX_H
  ctx.clearRect(0, 0, W, H)

  const imgW = img.naturalWidth || img.width
  const imgH = img.naturalHeight || img.height
  const ratio = imgW / imgH

  // If user uploads a wide panoramic wrap banner (e.g. 3-panel tea/beverage wrap banner, ratio >= 1.6)
  if (ratio >= 1.6) {
    // Slices panoramic artwork across carton faces so all sides form a continuous 360° scenery:
    // Left face = left panel, Front face = center brand panel, Right face = right panel, Back face = wrap
    const sliceW = imgW / 3
    let sliceX = 0
    if (face === 'left') {
      sliceX = 0
    } else if (face === 'front') {
      sliceX = sliceW
    } else if (face === 'right') {
      sliceX = sliceW * 2
    } else if (face === 'back') {
      sliceX = 0
    }
    ctx.drawImage(img, sliceX, 0, sliceW, imgH, 0, 0, W, H)
    return
  }

  // 100% FULL COVER: The artwork completely covers the entire vertical face from top to bottom
  drawImageCover(ctx, img, 0, 0, W, H)
}

/**
 * Utility: Draw image with object-fit: cover
 */
function drawImageCover(ctx, img, x, y, w, h) {
  const imgW = img.naturalWidth || img.width
  const imgH = img.naturalHeight || img.height
  const imgRatio = imgW / imgH
  const targetRatio = w / h

  let sW, sH, sX, sY
  if (imgRatio > targetRatio) {
    sH = imgH
    sW = imgH * targetRatio
    sX = (imgW - sW) / 2
    sY = 0
  } else {
    sW = imgW
    sH = imgW / targetRatio
    sX = 0
    sY = (imgH - sH) / 2
  }

  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h)
}

/**
 * --------------------------------------------------------------------------
 * LOGO BADGE MODE RENDERER
 * --------------------------------------------------------------------------
 */
function drawCartonFace(ctx, W, H, isFront) {
  ctx.clearRect(0, 0, W, H)

  // 1. Rich dark gradient background based on currentTheme
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0, currentTheme.bgDark)
  bg.addColorStop(0.45, currentTheme.bgMid)
  bg.addColorStop(0.85, currentTheme.bgDark)
  bg.addColorStop(1, '#05070c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle paper sheen overlay
  const sheen = ctx.createLinearGradient(0, 0, W, 0)
  sheen.addColorStop(0, 'rgba(255,255,255,0.02)')
  sheen.addColorStop(0.3, 'rgba(255,255,255,0.06)')
  sheen.addColorStop(0.7, 'rgba(255,255,255,0.02)')
  sheen.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, W, H)

  // 2. Glowing Sun / Orb on upper right using theme accent color
  ctx.save()
  const sunX = W * 0.74
  const sunY = H * 0.23
  const sunRadius = W * 0.28

  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.6, sunX, sunY, sunRadius * 1.3)
  sunGlow.addColorStop(0, hexToRgba(currentTheme.accent, 0.35))
  sunGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius * 1.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2)
  ctx.fillStyle = currentTheme.accent
  ctx.fill()
  ctx.restore()

  // 3. Flowing Cream & Dark Wave graphics
  drawWavesGraphic(ctx, W, H)

  // 4. Subtle top branding strip
  ctx.save()
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.fillText('SIPVERTISE', W * 0.08, H * 0.052)

  ctx.beginPath()
  ctx.moveTo(W * 0.08, H * 0.065)
  ctx.lineTo(W * 0.92, H * 0.065)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 5. Front Face specific: Logo area or Placeholder
  if (isFront) {
    if (uploadedImage) {
      drawLogoOnFace(ctx, uploadedImage, W, H)
    } else {
      drawPlaceholderPrompt(ctx, W, H)
    }

    drawBrandQR(ctx, W, H)

    ctx.save()
    ctx.font = '600 24px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('500ml · STILL WATER', W * 0.08, H * 0.95)
    ctx.restore()
  } else {
    drawSideInfo(ctx, W, H)
  }
}

/**
 * Signature water waves
 */
function drawWavesGraphic(ctx, W, H) {
  ctx.save()

  ctx.beginPath()
  ctx.moveTo(0, H * 0.42)
  ctx.bezierCurveTo(W * 0.28, H * 0.38, W * 0.62, H * 0.48, W, H * 0.44)
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath()
  ctx.fillStyle = currentTheme.waveCream
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, H * 0.58)
  ctx.bezierCurveTo(W * 0.32, H * 0.53, W * 0.65, H * 0.66, W, H * 0.61)
  ctx.lineTo(W, H * 0.72)
  ctx.bezierCurveTo(W * 0.65, H * 0.76, W * 0.32, H * 0.63, 0, H * 0.68)
  ctx.closePath()
  ctx.fillStyle = currentTheme.bgDark
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, H * 0.73)
  ctx.bezierCurveTo(W * 0.35, H * 0.69, W * 0.65, H * 0.81, W, H * 0.77)
  ctx.lineTo(W, H * 0.82)
  ctx.bezierCurveTo(W * 0.65, H * 0.86, W * 0.35, H * 0.74, 0, H * 0.78)
  ctx.closePath()
  ctx.fillStyle = currentTheme.bgMid
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, H * 0.86); ctx.lineTo(W * 0.75, H); ctx.lineTo(0, H); ctx.closePath()
  ctx.fillStyle = currentTheme.bgDark
  ctx.fill()

  ctx.restore()
}

/**
 * Placeholder prompt when no logo is uploaded
 */
function drawPlaceholderPrompt(ctx, W, H) {
  ctx.save()
  const boxW = W * 0.68, boxH = H * 0.22
  const boxX = (W - boxW) / 2, boxY = H * 0.29

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, 20) : ctx.fillRect(boxX, boxY, boxW, boxH)
  ctx.fill()

  ctx.setLineDash([16, 12])
  ctx.strokeStyle = hexToRgba(currentTheme.accent, 0.65)
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.setLineDash([])

  const cx = W / 2, cy = boxY + boxH * 0.38, plusSize = 22
  ctx.beginPath()
  ctx.moveTo(cx - plusSize, cy); ctx.lineTo(cx + plusSize, cy)
  ctx.moveTo(cx, cy - plusSize); ctx.lineTo(cx + plusSize, cy)
  ctx.strokeStyle = currentTheme.accent
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.font = '700 36px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('UPLOAD ARTWORK / LOGO', cx, boxY + boxH * 0.66)

  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = currentTheme.accent
  ctx.fillText('Wraps all 4 sides in 3D', cx, boxY + boxH * 0.82)
  ctx.restore()
}

/**
 * Logo overlay in Logo Mode
 */
function drawLogoOnFace(ctx, img, W, H) {
  ctx.save()
  const safeX = W * 0.08, safeY = H * 0.12, safeW = W * 0.84, safeH = H * 0.68
  const scaleRatio = (logoParams.size || 40) / 100
  let logoW = safeW * scaleRatio
  let logoH = logoW * (img.naturalHeight / img.naturalWidth)

  if (logoH > safeH * scaleRatio) {
    logoH = safeH * scaleRatio
    logoW = logoH * (img.naturalWidth / img.naturalHeight)
  }

  let drawX = safeX + (safeW - logoW) / 2
  let drawY = safeY + (safeH - logoH) / 2
  const pos = logoParams.position || 'center'
  if (pos.includes('top')) drawY = safeY + safeH * 0.06
  if (pos.includes('bottom')) drawY = safeY + safeH - logoH - safeH * 0.06
  if (pos.includes('left')) drawX = safeX + safeW * 0.04
  if (pos.includes('right')) drawX = safeX + safeW - logoW - safeW * 0.04

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8

  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, logoParams.opacity ?? 1.0))
  ctx.drawImage(img, drawX, drawY, logoW, logoH)
  ctx.restore()
  ctx.restore()
}

/**
 * QR Code Stamp
 */
function drawBrandQR(ctx, W, H) {
  ctx.save()
  const qrSize = W * 0.16
  const qrX = W - qrSize - W * 0.08
  const qrY = H - qrSize - H * 0.04

  ctx.fillStyle = '#ffffff'
  if (ctx.roundRect) {
    ctx.beginPath(); ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12); ctx.fill()
  } else {
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
  }

  ctx.fillStyle = currentTheme.bgDark
  const cells = 9, cellSize = qrSize / cells

  const drawCornerMarker = (ox, oy) => {
    ctx.fillRect(ox, oy, cellSize * 3, cellSize * 3)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(ox + cellSize * 0.6, oy + cellSize * 0.6, cellSize * 1.8, cellSize * 1.8)
    ctx.fillStyle = currentTheme.bgDark
    ctx.fillRect(ox + cellSize * 1.0, oy + cellSize * 1.0, cellSize * 1.0, cellSize * 1.0)
  }

  drawCornerMarker(qrX, qrY)
  drawCornerMarker(qrX + cellSize * 6, qrY)
  drawCornerMarker(qrX, qrY + cellSize * 6)

  const bits = [[4, 1], [4, 2], [3, 3], [5, 3], [4, 4], [3, 5], [4, 5], [5, 5], [7, 4], [8, 4], [6, 7], [7, 6], [8, 7], [7, 8]]
  bits.forEach(([x, y]) => {
    ctx.fillRect(qrX + x * cellSize, qrY + y * cellSize, cellSize * 0.85, cellSize * 0.85)
  })

  ctx.font = '800 18px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('SCAN TO CONNECT', qrX - 30, qrY + qrSize + 28)
  ctx.restore()
}

function drawSideInfo(ctx, W, H) {
  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('100% RECYCLABLE CARTON', W * 0.08, H * 0.35)

  ctx.font = '400 22px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)'
  const lines = [
    '· Plant-based materials',
    '· BPA free & zero microplastics',
    '· Lowest carbon footprint packaging',
    '· Distributed across premium venues'
  ]
  lines.forEach((l, i) => ctx.fillText(l, W * 0.08, H * 0.40 + i * 36))
  ctx.restore()
}

function makeTopTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#f9f7f2')
  grad.addColorStop(1, '#e8e3d8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(256, 0); ctx.lineTo(256, 512)
  ctx.moveTo(0, 256); ctx.lineTo(512, 256)
  ctx.stroke()

  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * Creates authentic 3D Gable-Top Water Carton geometry with sloping roof and top sealing fin
 */
function createGableCartonGeometry() {
  const geo = new THREE.BufferGeometry()

  const w = CARTON_W   // 1.08
  const hw = w / 2     // 0.54
  const d = CARTON_D   // 1.08
  const hd = d / 2     // 0.54

  const y0 = -1.18    // bottom
  const y1 = 0.94     // shoulder (where roof starts sloping)
  const y2 = 1.34     // ridge (where front and back slopes meet at z = 0)
  const y3 = 1.48     // top fin

  const positions = []
  const normals = []
  const uvs = []

  function pushQuad(p0, p1, p2, p3, uv0, uv1, uv2, uv3) {
    const vA = new THREE.Vector3(...p0)
    const vB = new THREE.Vector3(...p1)
    const vC = new THREE.Vector3(...p2)
    const cb = new THREE.Vector3().subVectors(vC, vB)
    const ab = new THREE.Vector3().subVectors(vA, vB)
    cb.cross(ab).normalize()
    const nx = cb.x, ny = cb.y, nz = cb.z

    positions.push(...p0, ...p1, ...p2)
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz)
    uvs.push(...uv0, ...uv1, ...uv2)

    positions.push(...p0, ...p2, ...p3)
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz)
    uvs.push(...uv0, ...uv2, ...uv3)
  }

  function pushTriangle(p0, p1, p2, uv0, uv1, uv2) {
    const vA = new THREE.Vector3(...p0)
    const vB = new THREE.Vector3(...p1)
    const vC = new THREE.Vector3(...p2)
    const cb = new THREE.Vector3().subVectors(vC, vB)
    const ab = new THREE.Vector3().subVectors(vA, vB)
    cb.cross(ab).normalize()
    const nx = cb.x, ny = cb.y, nz = cb.z

    positions.push(...p0, ...p1, ...p2)
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz)
    uvs.push(...uv0, ...uv1, ...uv2)
  }

  // --- MATERIAL 0: RIGHT FACE (+X) ---
  const startRight = positions.length / 3
  pushQuad(
    [hw, y0, hd], [hw, y0, -hd], [hw, y1, -hd], [hw, y1, hd],
    [0, 0], [1, 0], [1, 0.76], [0, 0.76]
  )
  pushTriangle(
    [hw, y1, hd], [hw, y1, -hd], [hw - 0.05, y2, 0],
    [0, 0.76], [1, 0.76], [0.5, 0.94]
  )
  const countRight = positions.length / 3 - startRight

  // --- MATERIAL 1: LEFT FACE (-X) ---
  const startLeft = positions.length / 3
  pushQuad(
    [-hw, y0, -hd], [-hw, y0, hd], [-hw, y1, hd], [-hw, y1, -hd],
    [0, 0], [1, 0], [1, 0.76], [0, 0.76]
  )
  pushTriangle(
    [-hw, y1, -hd], [-hw, y1, hd], [-hw + 0.05, y2, 0],
    [0, 0.76], [1, 0.76], [0.5, 0.94]
  )
  const countLeft = positions.length / 3 - startLeft

  // --- MATERIAL 2: TOP FIN ---
  const startTop = positions.length / 3
  pushQuad(
    [-hw, y3, 0.015], [hw, y3, 0.015], [hw, y3, -0.015], [-hw, y3, -0.015],
    [0, 0], [1, 0], [1, 1], [0, 1]
  )
  const countTop = positions.length / 3 - startTop

  // --- MATERIAL 3: BOTTOM (-Y) ---
  const startBottom = positions.length / 3
  pushQuad(
    [-hw, y0, -hd], [hw, y0, -hd], [hw, y0, hd], [-hw, y0, hd],
    [0, 0], [1, 0], [1, 1], [0, 1]
  )
  const countBottom = positions.length / 3 - startBottom

  // --- MATERIAL 4: FRONT FACE (+Z) ---
  const startFront = positions.length / 3
  pushQuad(
    [-hw, y0, hd], [hw, y0, hd], [hw, y1, hd], [-hw, y1, hd],
    [0, 0], [1, 0], [1, 0.76], [0, 0.76]
  )
  pushQuad(
    [-hw, y1, hd], [hw, y1, hd], [hw, y2, 0], [-hw, y2, 0],
    [0, 0.76], [1, 0.76], [1, 0.94], [0, 0.94]
  )
  pushQuad(
    [-hw, y2, 0.01], [hw, y2, 0.01], [hw, y3, 0.01], [-hw, y3, 0.01],
    [0, 0.94], [1, 0.94], [1, 1.0], [0, 1.0]
  )
  const countFront = positions.length / 3 - startFront

  // --- MATERIAL 5: BACK FACE (-Z) ---
  const startBack = positions.length / 3
  pushQuad(
    [hw, y0, -hd], [-hw, y0, -hd], [-hw, y1, -hd], [hw, y1, -hd],
    [0, 0], [1, 0], [1, 0.76], [0, 0.76]
  )
  pushQuad(
    [hw, y1, -hd], [-hw, y1, -hd], [-hw, y2, 0], [hw, y2, 0],
    [0, 0.76], [1, 0.76], [1, 0.94], [0, 0.94]
  )
  pushQuad(
    [hw, y2, -0.01], [-hw, y2, -0.01], [-hw, y3, -0.01], [hw, y3, -0.01],
    [0, 0.94], [1, 0.94], [1, 1.0], [0, 1.0]
  )
  const countBack = positions.length / 3 - startBack

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

  geo.addGroup(startRight, countRight, 0)
  geo.addGroup(startLeft, countLeft, 1)
  geo.addGroup(startTop, countTop, 2)
  geo.addGroup(startBottom, countBottom, 3)
  geo.addGroup(startFront, countFront, 4)
  geo.addGroup(startBack, countBack, 5)

  return geo
}

/**
 * Builds the 3D Carton mesh with 4 unique face textures
 */
function build3DCarton() {
  cartonGroup = new THREE.Group()

  // Materials for 6 faces:
  // 0: Right (+X)
  // 1: Left (-X)
  // 2: Top (+Y)
  // 3: Bottom (-Y)
  // 4: Front (+Z)
  // 5: Back (-Z)
  const cartonMaterials = [
    new THREE.MeshStandardMaterial({ map: rightTexture, roughness: 0.38, metalness: 0.08 }),
    new THREE.MeshStandardMaterial({ map: leftTexture, roughness: 0.38, metalness: 0.08 }),
    new THREE.MeshStandardMaterial({ map: topTexture, roughness: 0.65, metalness: 0.02 }),
    new THREE.MeshStandardMaterial({ color: 0x091220, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.32, metalness: 0.12 }),
    new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.38, metalness: 0.08 }),
  ]

  const bodyGeo = createGableCartonGeometry()
  const bodyMesh = new THREE.Mesh(bodyGeo, cartonMaterials)
  bodyMesh.castShadow = true
  bodyMesh.receiveShadow = true
  cartonGroup.add(bodyMesh)

  const edgeGeo = new THREE.EdgesGeometry(bodyGeo, 24)
  const edgeLine = new THREE.LineSegments(
    edgeGeo,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 })
  )
  cartonGroup.add(edgeLine)

  // Screw Cap angled on front sloping roof (matching real Pure-Pak / Tetra Rex carton)
  const hd = CARTON_D / 2 // 0.54
  // Slope runs from (y=1.34, z=0) to (y=0.94, z=hd=0.54)
  // The outward surface normal points forward (+Z) and upward (+Y)
  const slopeAngle = Math.atan2(1.34 - 0.94, hd) // Math.atan2(0.40, 0.54) = ~36.53°
  const y_cap = 1.14 + 0.003 * Math.cos(slopeAngle)
  const z_cap = (hd / 2) + 0.003 * Math.sin(slopeAngle)

  const capGroup = new THREE.Group()
  capGroup.position.set(0, y_cap, z_cap)
  capGroup.rotation.x = slopeAngle // Exactly perpendicular to front sloping panel!

  // Procedural ribbed bump texture for realistic vertical cap flutes
  const bumpC = document.createElement('canvas')
  bumpC.width = 256
  bumpC.height = 64
  const bCtx = bumpC.getContext('2d')
  bCtx.fillStyle = '#808080'
  bCtx.fillRect(0, 0, 256, 64)
  for (let x = 0; x < 256; x += 8) {
    bCtx.fillStyle = '#ffffff'
    bCtx.fillRect(x, 0, 4, 64)
    bCtx.fillStyle = '#181818'
    bCtx.fillRect(x + 4, 0, 4, 64)
  }
  const capBumpTex = new THREE.CanvasTexture(bumpC)
  capBumpTex.wrapS = THREE.RepeatWrapping
  capBumpTex.wrapT = THREE.ClampToEdgeWrapping

  const capCollarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentTheme.capColor),
    roughness: 0.40,
    metalness: 0.04
  })

  // Cap Collar Base (sitting flush on the carton slope)
  const collarH = 0.035
  const capCollarGeo = new THREE.CylinderGeometry(0.20, 0.21, collarH, 36)
  capCollar = new THREE.Mesh(capCollarGeo, capCollarMat)
  capCollar.position.y = collarH / 2
  capCollar.castShadow = true
  capGroup.add(capCollar)

  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentTheme.capColor),
    roughness: 0.30,
    metalness: 0.06,
    bumpMap: capBumpTex,
    bumpScale: 0.035
  })

  // Ribbed Screw Cap Cylinder
  const capH = 0.12
  const capGeo = new THREE.CylinderGeometry(0.18, 0.182, capH, 48)
  capMesh = new THREE.Mesh(capGeo, capMat)
  capMesh.position.y = collarH + capH / 2
  capMesh.castShadow = true
  capGroup.add(capMesh)

  // Cap Dome Top
  const domeH = 0.025
  const capDomeGeo = new THREE.CylinderGeometry(0.165, 0.18, domeH, 48)
  const capDome = new THREE.Mesh(capDomeGeo, capMat)
  capDome.position.y = collarH + capH + domeH / 2
  capDome.castShadow = true
  capGroup.add(capDome)

  cartonGroup.add(capGroup)

  cartonGroup.rotation.y = currentRotY
  cartonGroup.rotation.x = currentRotX
  scene.add(cartonGroup)
}

/**
 * Creates the canvas texture for round water bottle cylinder
 */
function buildCylinderTexture() {
  const c = document.createElement('canvas')
  c.width = BOTTLE_TEX_W
  c.height = BOTTLE_TEX_H
  cylinderCanvas = c
  cylinderCtx = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  cylinderTexture = tex
  redrawCylinderTexture()
}

/**
 * Redraws the round water bottle cylinder texture
 */
function redrawCylinderTexture() {
  if (!cylinderCtx) return
  const W = BOTTLE_TEX_W
  const H = BOTTLE_TEX_H
  const ctx = cylinderCtx
  ctx.clearRect(0, 0, W, H)

  if (uploadedImage) {
    // 100% FULL COVER: The uploaded artwork completely wraps the bottle cylinder
    const imgW = uploadedImage.naturalWidth || uploadedImage.width
    const imgH = uploadedImage.naturalHeight || uploadedImage.height
    const ratio = imgW / imgH

    if (ratio >= 1.6) {
      // 360° Panoramic Wrap: Maps full panoramic design all around the bottle circumference
      ctx.drawImage(uploadedImage, 0, 0, W, H)
    } else {
      drawImageCover(ctx, uploadedImage, 0, 0, W, H)
    }
  } else if (!uploadedImage && currentActiveSample === 'coffee') {
    drawCoffeeCylinderLabel(ctx, W, H)
  } else {
    // ═════════════════════════════════════════════════════════════════════════
    // AUTHENTIC SIPVERTISE WATER BOTTLE LABEL (Matches reference photo 1:1)
    // ═════════════════════════════════════════════════════════════════════════

    // 1. Deep Royal Blue Background with dynamic subtle gradients
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#06173d')
    bg.addColorStop(0.25, '#0a2663')
    bg.addColorStop(0.5, '#0e3488')
    bg.addColorStop(0.75, '#0a2663')
    bg.addColorStop(1, '#06173d')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Center radial blue glow behind billboard frame
    const radGlow = ctx.createRadialGradient(W / 2, H * 0.52, 60, W / 2, H * 0.52, 520)
    radGlow.addColorStop(0, 'rgba(28, 86, 214, 0.45)')
    radGlow.addColorStop(1, 'rgba(6, 23, 61, 0)')
    ctx.fillStyle = radGlow
    ctx.fillRect(0, 0, W, H)

    // Flowing aqua-cyan waves across lower third
    ctx.save()
    const waveY = H * 0.62
    ctx.fillStyle = 'rgba(0, 212, 255, 0.28)'
    ctx.beginPath()
    ctx.moveTo(0, waveY + 80)
    ctx.bezierCurveTo(W * 0.25, waveY + 140, W * 0.55, waveY + 20, W * 0.75, waveY + 90)
    ctx.bezierCurveTo(W * 0.88, waveY + 130, W * 0.95, waveY + 60, W, waveY + 70)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(0, 150, 255, 0.38)'
    ctx.beginPath()
    ctx.moveTo(0, waveY + 120)
    ctx.bezierCurveTo(W * 0.30, waveY + 50, W * 0.60, waveY + 160, W, waveY + 95)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // ── FRONT FACE (Centered at W / 2 = 1024) ──────────────────────────────
    const cX = W / 2

    // 1. "Sipvertise" logo header
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = '800 64px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#3bd6f5'
    ctx.letterSpacing = '1px'
    ctx.fillText('Sipvertise', cX, 155)

    // 2. Tagline
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.letterSpacing = '0.5px'
    ctx.fillText('Stay branded in when you can stand out', cX, 205)

    // 3. Yellow Billboard Bracket Frame
    const bx1 = cX - 290
    const bx2 = cX + 290
    const by1 = 260
    const by2 = 780
    const cLen = 65
    const yColor = '#ffe000'

    ctx.strokeStyle = yColor
    ctx.lineWidth = 8
    ctx.lineCap = 'square'

    // Top-Left bracket
    ctx.beginPath()
    ctx.moveTo(bx1 + cLen, by1)
    ctx.lineTo(bx1, by1)
    ctx.lineTo(bx1, by1 + cLen)
    ctx.stroke()

    // Top-Right bracket
    ctx.beginPath()
    ctx.moveTo(bx2 - cLen, by1)
    ctx.lineTo(bx2, by1)
    ctx.lineTo(bx2, by1 + cLen)
    ctx.stroke()

    // Bottom-Left bracket
    ctx.beginPath()
    ctx.moveTo(bx1 + cLen, by2)
    ctx.lineTo(bx1, by2)
    ctx.lineTo(bx1, by2 - cLen)
    ctx.stroke()

    // Bottom-Right bracket
    ctx.beginPath()
    ctx.moveTo(bx2 - cLen, by2)
    ctx.lineTo(bx2, by2)
    ctx.lineTo(bx2, by2 - cLen)
    ctx.stroke()

    // 4. Billboard Bold Text inside brackets
    ctx.fillStyle = yColor
    ctx.font = '900 86px "Plus Jakarta Sans", sans-serif'
    ctx.letterSpacing = '5px'
    ctx.fillText('PLACE', cX, 362)
    ctx.fillText('YOUR', cX, 468)

    // "A D" with horizontal bottle silhouette in between
    const adY = 582
    ctx.font = '900 86px "Plus Jakarta Sans", sans-serif'
    ctx.fillText('A', cX - 165, adY)
    ctx.fillText('D', cX + 165, adY)

    // Horizontal bottle silhouette between A and D
    const botW = 210
    const botH = 54
    const botX = cX - botW / 2
    const botTopY = adY - 58
    ctx.strokeStyle = yColor
    ctx.lineWidth = 5
    // Rounded bottle body
    ctx.beginPath()
    ctx.roundRect(botX, botTopY, botW - 14, botH, [27, 27, 27, 27])
    ctx.stroke()
    // Bottle cap on right
    ctx.fillStyle = yColor
    ctx.fillRect(botX + botW - 14, botTopY + 16, 14, 22)

    // Wave line inside bottle shape
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(botX + 18, botTopY + 28)
    ctx.bezierCurveTo(botX + 70, botTopY + 14, botX + 120, botTopY + 40, botX + botW - 32, botTopY + 26)
    ctx.stroke()

    // "HERE"
    ctx.fillStyle = yColor
    ctx.font = '900 86px "Plus Jakarta Sans", sans-serif'
    ctx.letterSpacing = '5px'
    ctx.fillText('HERE', cX, 696)

    // 5. Bottom slogan
    ctx.font = '700 27px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.letterSpacing = '0.5px'
    ctx.fillText('Affordable Hydration with', cX, 850)
    ctx.fillText('Influencizing branding solutions.', cX, 888)
    ctx.restore()

    // ── LEFT FLANK (Mineral Facts & 500ml Badge) ─────────────────────────
    ctx.save()
    const lX = 380
    // 500 ML Badge
    ctx.fillStyle = 'rgba(0, 212, 255, 0.15)'
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(lX - 85, 140, 170, 52, 26)
    ctx.fill()
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('500 ML', lX, 176)

    // Table
    ctx.textAlign = 'left'
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00d4ff'
    ctx.letterSpacing = '2px'
    ctx.fillText('TYPICAL ANALYSIS', lX - 110, 260)
    ctx.font = '500 19px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('Calcium (Ca)    12.4 mg/L', lX - 110, 305)
    ctx.fillText('Magnesium (Mg)   5.8 mg/L', lX - 110, 345)
    ctx.fillText('Sodium (Na)      8.2 mg/L', lX - 110, 385)
    ctx.fillText('Potassium (K)    2.1 mg/L', lX - 110, 425)
    ctx.fillText('pH Level         7.4 Pure', lX - 110, 465)
    ctx.fillText('TDS             <110 mg/L', lX - 110, 505)

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText('🌱 100% Recyclable PET', lX - 110, 580)
    ctx.fillText('💧 RO & Ozonated Pure', lX - 110, 615)
    ctx.fillText('🛡️ BPA Free Food Grade', lX - 110, 650)
    ctx.restore()

    // ── RIGHT FLANK (Certifications & Eco Badges) ─────────────────────────
    ctx.save()
    const rX = 1668
    ctx.textAlign = 'center'
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#00d4ff'
    ctx.letterSpacing = '2px'
    ctx.fillText('CERTIFIED QUALITY', rX, 260)

    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('FSSAI LIC. NO. 11322001000452', rX, 310)
    ctx.fillText('ISO 9001:2015 CERTIFIED', rX, 350)
    ctx.fillText('PACKAGED DRINKING WATER', rX, 390)
    ctx.fillText('IS:14543 CM/L-6789123', rX, 430)

    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = '#ffe000'
    ctx.fillText('♻️ CRUSH BOTTLE AFTER USE', rX, 510)
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('Store in clean, cool & dry conditions', rX, 550)
    ctx.fillText('away from direct sunlight', rX, 580)
    ctx.restore()

    // ── BACK SEAM (Barcode & QR Code) ────────────────────────────────────
    ctx.save()
    // Barcode lines near X = 40
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(25, 300, 120, 200)
    ctx.fillStyle = '#000000'
    for (let i = 35; i < 135; i += 5) {
      const barW = (i % 3 === 0) ? 3 : 2
      ctx.fillRect(i, 310, barW, 160)
    }
    ctx.font = '700 14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('8 901234 567890', 85, 490)

    // QR Code near X = 1960
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(W - 150, 300, 120, 120)
    ctx.fillStyle = '#000000'
    // QR position patterns
    ctx.fillRect(W - 140, 310, 32, 32)
    ctx.clearRect(W - 134, 316, 20, 20)
    ctx.fillRect(W - 130, 320, 12, 12)

    ctx.fillRect(W - 62, 310, 32, 32)
    ctx.clearRect(W - 56, 316, 20, 20)
    ctx.fillRect(W - 52, 320, 12, 12)

    ctx.fillRect(W - 140, 378, 32, 32)
    ctx.clearRect(W - 134, 384, 20, 20)
    ctx.fillRect(W - 130, 388, 12, 12)

    // Random QR modules
    for (let qy = 310; qy < 410; qy += 7) {
      for (let qx = W - 140; qx < W - 40; qx += 7) {
        if ((qx * 13 + qy * 7) % 5 === 0) {
          ctx.fillRect(qx, qy, 6, 6)
        }
      }
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCAN TO CONNECT', W - 90, 445)
    ctx.font = '500 14px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('sipvertise.in', W - 90, 470)
    ctx.restore()
  }

  if (cylinderTexture) cylinderTexture.needsUpdate = true
}

/**
 * Builds the authentic 3D round water bottle:
 * - Circular display pedestal podium (matching reference photo)
 * - Crystal-clear transparent PET plastic bottle shell (LatheGeometry)
 * - Pure clear water inside core
 * - Middle 360° cylindrical wrap label
 * - Royal blue screw cap with vertical fluted fluting ridges
 */
function build3DWaterBottle() {
  cartonGroup = new THREE.Group()

  const bodyR = BOTTLE_R // 0.48
  const bodySegments = 64
  const capColorHex = currentTheme.capColor && currentTheme.capColor !== '#fcfbfa'
    ? currentTheme.capColor
    : '#0e66ea' // Signature royal blue from reference image

  // ── 1. CRYSTAL-CLEAR TRANSPARENT PET PLASTIC BOTTLE ───────────────────────
  // Lathe points for continuous photorealistic bottle profile
  const bottleProfile = [
    new THREE.Vector2(0.00, -1.13), // Bottom concave dome apex
    new THREE.Vector2(0.18, -1.15),
    new THREE.Vector2(0.32, -1.19),
    new THREE.Vector2(0.42, -1.21), // Standing rim on pedestal
    new THREE.Vector2(0.47, -1.18), // Bottom outer radius
    new THREE.Vector2(0.48, -1.08),
    new THREE.Vector2(0.48, -0.90), // Clear lower base (visible water)
    new THREE.Vector2(0.48, 0.54), // Label area body
    new THREE.Vector2(0.478, 0.62), // Shoulder curve starts
    new THREE.Vector2(0.46, 0.74),
    new THREE.Vector2(0.41, 0.88),
    new THREE.Vector2(0.32, 1.00),
    new THREE.Vector2(0.22, 1.08),
    new THREE.Vector2(0.178, 1.13), // Neck base
    new THREE.Vector2(0.178, 1.28), // Threaded neck
    new THREE.Vector2(0.172, 1.34)  // Lip rim
  ]
  const bottleGeo = new THREE.LatheGeometry(bottleProfile, bodySegments)
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5f9ff,
    transmission: 0.94,
    opacity: 1.0,
    transparent: true,
    roughness: 0.05,
    metalness: 0.04,
    ior: 1.49, // Authentic PET plastic refraction index
    thickness: 0.32,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    specularIntensity: 1.2,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat)
  bottleMesh.castShadow = true
  bottleMesh.receiveShadow = true
  cartonGroup.add(bottleMesh)

  // ── 2. PURE CLEAR WATER INSIDE CORE ───────────────────────────────────────
  const waterProfile = [
    new THREE.Vector2(0.00, -1.12),
    new THREE.Vector2(0.16, -1.14),
    new THREE.Vector2(0.30, -1.17),
    new THREE.Vector2(0.40, -1.19),
    new THREE.Vector2(0.45, -1.16),
    new THREE.Vector2(0.46, -1.06),
    new THREE.Vector2(0.46, 0.54),
    new THREE.Vector2(0.44, 0.72),
    new THREE.Vector2(0.39, 0.86),
    new THREE.Vector2(0.30, 0.96),
    new THREE.Vector2(0.00, 0.96) // Water surface meniscus cap
  ]
  const waterGeo = new THREE.LatheGeometry(waterProfile, bodySegments)
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f4ff,
    transmission: 0.94,
    opacity: 1.0,
    transparent: true,
    roughness: 0.02,
    ior: 1.333, // Water refractive index
    thickness: 0.55,
    depthWrite: false,
    side: THREE.FrontSide
  })
  const waterMesh = new THREE.Mesh(waterGeo, waterMat)
  cartonGroup.add(waterMesh)

  // ── 3. MIDDLE CYLINDRICAL WRAP LABEL ──────────────────────────────────────
  // Middle label band leaving transparent bottle + water visible above & below
  const labelH = 1.44
  const labelY = -0.18 // Sits from -0.90 to +0.54
  const labelGeo = new THREE.CylinderGeometry(bodyR + 0.003, bodyR + 0.003, labelH, bodySegments, 1, true)
  const labelMat = new THREE.MeshStandardMaterial({
    map: cylinderTexture,
    roughness: 0.22,
    metalness: 0.04,
    side: THREE.DoubleSide
  })
  const labelMesh = new THREE.Mesh(labelGeo, labelMat)
  labelMesh.position.y = labelY
  labelMesh.rotation.y = -Math.PI / 2 // Faces center of canvas directly at camera
  labelMesh.castShadow = true
  cartonGroup.add(labelMesh)

  // ── 4. ROYAL BLUE RIBBED SCREW CAP WITH VERTICAL FLUTING ──────────────────
  // Procedural ribbed bump texture for vertical plastic flutes
  const bumpC = document.createElement('canvas')
  bumpC.width = 512
  bumpC.height = 128
  const bCtx = bumpC.getContext('2d')
  bCtx.fillStyle = '#808080'
  bCtx.fillRect(0, 0, 512, 128)
  for (let x = 0; x < 512; x += 8) {
    bCtx.fillStyle = '#ffffff'
    bCtx.fillRect(x, 0, 4, 128)
    bCtx.fillStyle = '#101010'
    bCtx.fillRect(x + 4, 0, 4, 128)
  }
  const capBumpTex = new THREE.CanvasTexture(bumpC)
  capBumpTex.wrapS = THREE.RepeatWrapping
  capBumpTex.wrapT = THREE.ClampToEdgeWrapping
  capBumpTex.repeat.set(1, 1)

  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(capColorHex),
    roughness: 0.30,
    metalness: 0.08,
    bumpMap: capBumpTex,
    bumpScale: 0.04
  })

  // Security collar ring
  const capCollarGeo = new THREE.CylinderGeometry(0.198, 0.198, 0.042, 48)
  capCollar = new THREE.Mesh(capCollarGeo, capMat)
  capCollar.position.y = 1.18
  capCollar.castShadow = true
  cartonGroup.add(capCollar)

  // Main Ribbed Screw Cap body
  const capGeo = new THREE.CylinderGeometry(0.194, 0.196, 0.19, 64)
  capMesh = new THREE.Mesh(capGeo, capMat)
  capMesh.position.y = 1.295
  capMesh.castShadow = true
  cartonGroup.add(capMesh)

  // Cap top dome
  const domeGeo = new THREE.CylinderGeometry(0.186, 0.194, 0.025, 48)
  const capDomeMesh = new THREE.Mesh(domeGeo, capMat)
  capDomeMesh.position.y = 1.395
  cartonGroup.add(capDomeMesh)

  cartonGroup.rotation.y = currentRotY
  cartonGroup.rotation.x = currentRotX
  scene.add(cartonGroup)
}

/**
 * Public API: Switch between 'carton' and 'bottle' model types
 */
export function setBottleModel(type) {
  bottleModel = (type === 'bottle' || type === 'waterbottle') ? 'bottle' : 'carton'

  // Tear down existing group
  if (cartonGroup) {
    scene.remove(cartonGroup)
    cartonGroup.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
    })
    cartonGroup = null
  }

  capMesh = null
  capCollar = null

  if (bottleModel === 'bottle') {
    currentTheme.capColor = '#0e66ea'
    redrawCylinderTexture()
    build3DWaterBottle()
    targetZoom = 5.2
  } else {
    currentTheme.capColor = '#fcfbfa'
    redrawAllFaces()
    build3DCarton()
    targetZoom = 5.0
  }
}

function animate() {
  animFrameId = requestAnimationFrame(animate)

  if (autoRotate) {
    targetRotY += 0.007
  }

  currentRotY += (targetRotY - currentRotY) * 0.085
  currentRotX += (targetRotX - currentRotX) * 0.085

  currentZoom += (targetZoom - currentZoom) * 0.085
  camera.position.z = currentZoom

  if (cartonGroup) {
    cartonGroup.rotation.y = currentRotY
    cartonGroup.rotation.x = Math.max(-0.48, Math.min(0.48, currentRotX))
  }

  renderer.render(scene, camera)
}

function bindEvents(container) {
  const dom = renderer.domElement

  dom.addEventListener('mousedown', (e) => {
    isDragging = true
    autoRotate = false
    prevMouseX = e.clientX
    prevMouseY = e.clientY
    dom.style.cursor = 'grabbing'
    clearTimeout(idleTimer)
  })

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - prevMouseX
    const dy = e.clientY - prevMouseY
    targetRotY += dx * 0.013
    targetRotX += dy * 0.009
    prevMouseX = e.clientX
    prevMouseY = e.clientY
  })

  window.addEventListener('mouseup', () => {
    if (!isDragging) return
    isDragging = false
    dom.style.cursor = 'grab'
    scheduleAutoRotate()
  })

  dom.addEventListener('wheel', (e) => {
    e.preventDefault()
    targetZoom = Math.max(3.8, Math.min(7.2, targetZoom + e.deltaY * 0.0035))
  }, { passive: false })

  let touchStartDist = 0
  let lx = 0, ly = 0

  dom.addEventListener('touchstart', (e) => {
    autoRotate = false
    clearTimeout(idleTimer)
    if (e.touches.length === 1) {
      lx = e.touches[0].clientX
      ly = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    }
  }, { passive: true })

  dom.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lx
      const dy = e.touches[0].clientY - ly
      targetRotY += dx * 0.014
      targetRotX += dy * 0.010
      lx = e.touches[0].clientX
      ly = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const diff = touchStartDist - dist
      targetZoom = Math.max(3.8, Math.min(7.2, targetZoom + diff * 0.008))
      touchStartDist = dist
    }
  }, { passive: true })

  dom.addEventListener('touchend', () => scheduleAutoRotate())
}

function scheduleAutoRotate() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => { autoRotate = true }, 3500)
}

function onResize(container) {
  if (!container || !renderer || !camera) return
  const w = container.clientWidth
  const h = container.clientHeight
  if (w <= 0 || h <= 0) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

/**
 * --------------------------------------------------------------------------
 * AI / Dynamic Dominant Color Extraction from Artwork Image
 * --------------------------------------------------------------------------
 */
export function extractLogoPalette(img) {
  try {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    const sz = 64
    c.width = sz; c.height = sz
    ctx.drawImage(img, 0, 0, sz, sz)
    const imgData = ctx.getImageData(0, 0, sz, sz).data

    const samples = []
    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2], a = imgData[i + 3]
      if (a < 80) continue

      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const sat = max === 0 ? 0 : (max - min) / max
      const lum = (max + min) / 510

      if (sat > 0.15 && lum > 0.12 && lum < 0.90) {
        samples.push({ r, g, b, sat, weight: (sat * 2) + (1 - Math.abs(lum - 0.5)) })
      }
    }

    if (samples.length === 0) {
      return {
        id: 'auto-matched',
        name: 'Auto Brand Match',
        bgDark: '#0e121a',
        bgMid: '#1a2336',
        accent: '#f7c61a',
        waveCream: '#f5f0e6',
        waveDark: '#0e121a',
        capColor: '#ffffff'
      }
    }

    samples.sort((a, b) => b.weight - a.weight)
    const best = samples[0]
    const brandHex = rgbToHex(best.r, best.g, best.b)

    const darkR = Math.max(6, Math.min(32, Math.round(best.r * 0.12)))
    const darkG = Math.max(8, Math.min(32, Math.round(best.g * 0.12)))
    const darkB = Math.max(12, Math.min(42, Math.round(best.b * 0.16)))
    const bgDark = rgbToHex(darkR, darkG, darkB)

    const midR = Math.max(12, Math.min(54, Math.round(best.r * 0.22)))
    const midG = Math.max(16, Math.min(54, Math.round(best.g * 0.22)))
    const midB = Math.max(22, Math.min(70, Math.round(best.b * 0.28)))
    const bgMid = rgbToHex(midR, midG, midB)

    return {
      id: 'auto-matched',
      name: 'Auto Brand Match',
      bgDark,
      bgMid,
      accent: brandHex,
      waveCream: '#f8f4ec',
      waveDark: bgDark,
      capColor: '#ffffff'
    }
  } catch (err) {
    console.warn('Color extraction fallback:', err)
    return THEMES.navy
  }
}

/**
 * Apply a theme to the 3D bottle
 */
function updateCapColors() {
  if (capMesh && capMesh.material) capMesh.material.color.set(currentTheme.capColor || '#ffffff')
  if (capCollar && capCollar.material) capCollar.material.color.set(currentTheme.capColor || '#ffffff')
}

export function setBottleTheme(themeKeyOrObj) {
  if (typeof themeKeyOrObj === 'string') {
    currentTheme = THEMES[themeKeyOrObj] ? { ...THEMES[themeKeyOrObj] } : { ...THEMES.navy }
  } else if (themeKeyOrObj && typeof themeKeyOrObj === 'object') {
    currentTheme = { ...currentTheme, ...themeKeyOrObj }
  }

  updateCapColors()
  if (rimLight) rimLight.color.set(currentTheme.accent || '#f7c61a')

  refreshTextures()

  if (onThemeChangeCallback) onThemeChangeCallback(currentTheme)
}

export function setCustomColors(bgDark, accent) {
  autoColorMatch = false
  const bgMid = adjustBrightness(bgDark, 25)
  setBottleTheme({
    id: 'custom',
    name: 'Custom Brand',
    bgDark,
    bgMid,
    accent,
    waveCream: '#f8f4ec',
    waveDark: bgDark,
    capColor: '#ffffff'
  })
}

export function toggleAutoColorMatch(enabled) {
  autoColorMatch = typeof enabled === 'boolean' ? enabled : !autoColorMatch
  if (autoColorMatch && uploadedImage) {
    const extracted = extractLogoPalette(uploadedImage)
    setBottleTheme(extracted)
  }
  return autoColorMatch
}

/**
 * Public API: Update image from File or URL
 */
export function updateImage(fileOrUrl, params) {
  if (params) logoParams = { ...logoParams, ...params }
  return new Promise((resolve, reject) => {
    if (typeof fileOrUrl === 'string') {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        uploadedImage = img
        if (autoColorMatch) {
          const extracted = extractLogoPalette(img)
          setBottleTheme(extracted)
        } else {
          refreshTextures()
        }
        resolve(img)
      }
      img.onerror = reject
      img.src = fileOrUrl
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          uploadedImage = img
          if (autoColorMatch) {
            const extracted = extractLogoPalette(img)
            setBottleTheme(extracted)
          } else {
            refreshTextures()
          }
          resolve(img)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(fileOrUrl)
    }
  })
}

function refreshTextures() {
  if (bottleModel === 'bottle') {
    redrawCylinderTexture()
  } else {
    redrawAllFaces()
  }
}

export function setStudioMode(mode) {
  studioMode = mode // 'full-wrap' or 'logo'
  refreshTextures()
}

export function setWrapAllSides(enabled) {
  wrapAllSides = !!enabled
  refreshTextures()
}

export function setCampaignFrame(frame) {
  campaignFrame = frame // 'poster' or 'bleed'
  refreshTextures()
}

export function setCustomTexts(header, footer, contact) {
  if (header !== undefined) brandHeaderText = header
  if (footer !== undefined) brandFooterText = footer
  if (contact !== undefined) brandContactText = contact
  refreshTextures()
}

export function setLogoParams(params) {
  logoParams = { ...logoParams, ...params }
  refreshTextures()
}

export function removeLogo() {
  uploadedImage = null
  if (bottleModel === 'bottle') {
    redrawCylinderTexture()
  } else {
    redrawAllFaces()
  }
}

export function toggleAutoRotate(state) {
  autoRotate = typeof state === 'boolean' ? state : !autoRotate
  return autoRotate
}

export function resetView() {
  targetRotY = 0.52
  targetRotX = 0.08
  targetZoom = 5.0
  autoRotate = false
  scheduleAutoRotate()
}

export function takeScreenshot() {
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}

/**
 * Public API: Load pre-made Full Wrap campaign visuals
 */
export function loadSampleFullWrap(type) {
  setStudioMode('full-wrap')
  currentActiveSample = type

  if (type === 'coffee') {
    uploadedImage = null
    currentTheme.capColor = '#1f1b18'
    updateCapColors()
    loadCoffeeArtwork()
    refreshTextures()
    return
  }

  if (type === 'sipvertise') {
    uploadedImage = null
    currentTheme.capColor = bottleModel === 'bottle' ? '#0e66ea' : '#fcfbfa'
    updateCapColors()
    refreshTextures()
    return
  }

  const map = {
    resort: {
      url: '/sample-resort-ad.jpg',
      header: 'PREMIUM VILLA RESORT',
      footer: '05 EXCLUSIVE RESIDENCES',
      contact: '+91 8281936307 · www.scatur.com'
    }
  }

  const selected = map[type] || map.resort
  brandHeaderText = selected.header
  brandFooterText = selected.footer
  brandContactText = selected.contact

  updateImage(selected.url)
}

/**
 * Public API: Load logo vector samples
 */
export function loadSampleLogo(brandType) {
  setStudioMode('logo')
  const svgMap = {
    tech: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="transparent"/><path d="M120 100 L160 40 L180 80 L220 30 L200 130 L160 110 Z" fill="#00d2ff"/><text x="200" y="165" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#00d2ff" text-anchor="middle" letter-spacing="4">VOLT ENERGY</text></svg>`,
    coffee: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="transparent"/><circle cx="200" cy="80" r="50" fill="none" stroke="#e5b842" stroke-width="6"/><path d="M185 65 C185 50 215 50 215 65 C215 80 185 85 200 105" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><text x="200" y="165" font-family="Arial, sans-serif" font-weight="800" font-size="32" fill="#e5b842" text-anchor="middle" letter-spacing="3">BREW &amp; CO.</text></svg>`,
    fitness: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="transparent"/><path d="M160 95 L200 50 L240 95 L225 95 L200 68 L175 95 Z" fill="#ff334b"/><path d="M150 115 L200 70 L250 115 L235 115 L200 88 L165 115 Z" fill="#ffffff"/><text x="200" y="165" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="#ff334b" text-anchor="middle" letter-spacing="4">APEX FIT</text></svg>`
  }

  const svgStr = svgMap[brandType] || svgMap.tech
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    uploadedImage = img
    if (autoColorMatch) {
      const extracted = extractLogoPalette(img)
      setBottleTheme(extracted)
    } else {
      refreshTextures()
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
}

// Helpers
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function adjustBrightness(hex, percent) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  let r = Math.min(255, Math.max(0, ((num >> 16) & 255) + Math.round(255 * (percent / 100))))
  let g = Math.min(255, Math.max(0, ((num >> 8) & 255) + Math.round(255 * (percent / 100))))
  let b = Math.min(255, Math.max(0, (num & 255) + Math.round(255 * (percent / 100))))
  return rgbToHex(r, g, b)
}

function destroyMockup(container, ro) {
  cancelAnimationFrame(animFrameId)
  clearTimeout(idleTimer)
  if (ro) ro.disconnect()
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }
}