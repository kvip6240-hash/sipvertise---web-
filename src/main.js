import './style.css'
import 'lenis/dist/lenis.css'
import './enhancements.css'
import Lenis from 'lenis'
import { initCampaignForm } from './components/campaignForm.js'
import { initAdminDashboard, initHealthCheckIndicator } from './components/adminDashboard.js'

// Initialize luxury smooth momentum scrolling
const lenis = new Lenis({
	duration: 1.2,
	easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
	orientation: 'vertical',
	gestureOrientation: 'vertical',
	smoothWheel: true,
	wheelMultiplier: 1,
	touchMultiplier: 1.6,
	infinite: false,
})

function lenisRaf(time) {
	lenis.raf(time)
	requestAnimationFrame(lenisRaf)
}
requestAnimationFrame(lenisRaf)

window.lenis = lenis

const VIDEO_SRC = '/Cartons_floating_in_zero_gravity_20261006112102_erasio.mp4'
const SCROLL_LENGTH_VH = 450
const MOBILE_SCROLL_LENGTH_VH = 320
const SMOOTHING = 0.26
const VIDEO_END_PROGRESS = 0.6

document.querySelector('#app').innerHTML = `
<header class="site-header"><a class="logo" href="#top" aria-label="Sipvertise home"><img class="brand-logo" src="/sipvertise-logo-badge.png" alt="Sipvertise"></a><nav id="site-navigation"><a href="#bottle-story">THE BOTTLE</a><a href="#why-brands-use-us">WHY US</a><a href="#compare">COMPARE</a><a href="#how">HOW IT MOVES</a><a href="#where">WHERE IT WORKS</a><a href="/studio.html" class="nav-get-demo">GET A DEMO ↗</a><a class="nav-cta" href="#start-campaign">START A CAMPAIGN ↗</a></nav><button class="menu" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-navigation">☰</button></header>
<main id="top">
<section class="hero dark reveal"><div class="hero-copy"><p class="hero-pill">NO SCROLLS. JUST REAL-WORLD REACH.</p><h1><span class="hero-title-top">Don't just advertise.</span><em>Sipvertise.</em></h1><p class="hero-subcopy">The advertising people see, carry and remember. Put your brand into a useful everyday moment.</p><a class="hero-primary" href="#start-campaign">START A CAMPAIGN ↗</a></div><div class="hero-art"><video autoplay muted loop playsinline><source src="/Woman_drinking_water_from_bottle_20260924135007_erasio.mp4" type="video/mp4"></video></div><a class="scroll" href="#bottle-story" aria-label="Scroll to the bottle story">↓</a></section>
<section class="product-scroll" id="bottle-story" aria-labelledby="bottle-story-title"><div class="product-stage"><div class="product-intro-line" aria-hidden="true">Your brand.<br>In every hand.</div><div class="product-layout"><div class="product-copy"><p class="product-eyebrow">SIPVERTISE BOTTLE</p><h2 id="bottle-story-title">Advertising<br>you can hold.</h2><ol class="product-features"><li aria-current="step"><span class="feature-number">01</span><span><strong>Full-wrap ad space</strong><small>Your brand covers the entire bottle.</small></span></li><li><span class="feature-number">02</span><span><strong>Daily visibility</strong><small>In hand for minutes to hours.</small></span></li><li><span class="feature-number">03</span><span><strong>Interactive QR</strong><small>Scan to offer, page or promo.</small></span></li><li><span class="feature-number">04</span><span><strong>Precise targeting</strong><small>By venue or event.</small></span></li><li><span class="feature-number">05</span><span><strong>Measurable results</strong><small>Scans and visits you can track.</small></span></li></ol></div><div class="product-card" aria-label="Sipvertise campaign feature video" style="overflow: hidden; padding: 0; display: flex; align-items: center; justify-content: center; background: #020914; border: none; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08); border-radius: 24px;"><video autoplay muted loop playsinline preload="auto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 22px; transform: scale(1.02);"><source src="/carton-brand-transform.mp4" type="video/mp4"></video></div></div><div class="bottle-canvas-wrap"><video class="bottle-sequence-source" muted playsinline preload="auto" aria-hidden="true"><source src="/Cartons_floating_in_zero_gravity_20261006112102_erasio.mp4" type="video/mp4"></video><canvas aria-label="Sipvertise product rotation controlled by scrolling" role="img"></canvas></div></div></section>

<section id="why-brands-use-us" class="why-brands-use-us cream reveal" aria-labelledby="why-brands-title"><div class="why-brands-header"><p class="eyebrow">[ WHY BRANDS USE US ]</p><h2 id="why-brands-title">The medium that stays.<br><em>In hand. In mind.</em></h2><p class="why-brands-lead">Businesses choose branded water bottles to cut through digital clutter and put their brand directly into real everyday moments.</p></div><div class="why-brands-content-wrap"><div class="why-brands-left"><div class="why-brands-grid"><article class="why-card" data-index="0"><div class="why-card-top"><span class="why-number">01</span><span class="why-tag">TANGIBLE MEDIA</span></div><div><h3>Physical Brand Visibility</h3><p>Your brand stays visible in the hands of real people.</p></div></article><article class="why-card" data-index="1"><div class="why-card-top"><span class="why-number">02</span><span class="why-tag">TARGETED PLACEMENT</span></div><div><h3>Event-Based Targeting</h3><p>Reach the exact audience that matters to your campaign.</p></div></article><article class="why-card" data-index="2"><div class="why-card-top"><span class="why-number">03</span><span class="why-tag">CREATIVE FREEDOM</span></div><div><h3>Custom Brand Experience</h3><p>Add your logo, campaign message, QR code, offer, or promotion to the bottle.</p></div></article><article class="why-card" data-index="3"><div class="why-card-top"><span class="why-number">04</span><span class="why-tag">HIGH RETENTION</span></div><div><h3>High-Frequency Exposure</h3><p>A single bottle can create repeated brand impressions throughout its use.</p></div></article><article class="why-card" data-index="4"><div class="why-card-top"><span class="why-number">05</span><span class="why-tag">DIRECT ATTRIBUTION</span></div><div><h3>Measurable Campaigns</h3><p>Use QR codes and campaign tracking where applicable.</p></div></article></div></div><div class="why-brands-right"><div class="why-brands-sticky-visual"><img class="why-sticky-img is-active" src="/sipvertise-carton-bottle.png" alt="Sipvertise Bottle 1" aria-hidden="true"><img class="why-sticky-img" src="/sipvertise-carton-bottle.png" alt="Sipvertise Bottle 2" aria-hidden="true"><img class="why-sticky-img" src="/sipvertise-carton-bottle.png" alt="Sipvertise Bottle 3" aria-hidden="true"><img class="why-sticky-img" src="/sipvertise-carton-bottle.png" alt="Sipvertise Bottle 4" aria-hidden="true"><img class="why-sticky-img" src="/sipvertise-carton-bottle.png" alt="Sipvertise Bottle 5" aria-hidden="true"></div></div></div></section>

<section id="compare" class="comparison yellow reveal" aria-labelledby="comparison-title"><div class="comparison-header"><p class="eyebrow">[ A DIFFERENT KIND OF REACH ]</p><h2 id="comparison-title">Compare the way it travels.</h2></div><div class="comparison-scroll" tabindex="0" role="region" aria-label="Advertising format comparison table; scroll horizontally to see all columns"><table class="comparison-table"><thead><tr><th scope="col" class="th-feature">Feature</th><th scope="col">Billboards</th><th scope="col">Print</th><th scope="col">Digital</th><th scope="col" class="sipvertise-column"><div class="sip-header"><span class="sip-tag">DIRECT MEDIA</span><span class="sip-brand">Sipvertise bottles</span></div></th></tr></thead><tbody><tr><th scope="row"><span class="feat-title">Mobility</span><span class="feat-subtitle">How ads move</span></th><td>Fixed</td><td>Thrown away</td><td>On screen only</td><td class="sipvertise-column"><div class="sip-cell"><span class="sip-star">✦</span><span>Moves with consumers</span></div></td></tr><tr><th scope="row"><span class="feat-title">Visibility</span><span class="feat-subtitle">Attention duration</span></th><td>Seconds</td><td>Buried in clutter</td><td>Skipped or blocked</td><td class="sipvertise-column"><div class="sip-cell"><span class="sip-star">✦</span><span>Minutes to hours</span></div></td></tr><tr><th scope="row"><span class="feat-title">Interaction</span><span class="feat-subtitle">Engagement format</span></th><td>None</td><td>Inconvenient QR</td><td>Clicks</td><td class="sipvertise-column"><div class="sip-cell"><span class="sip-star">✦</span><span>QR codes and promotions</span></div></td></tr><tr><th scope="row"><span class="feat-title">Targeting</span><span class="feat-subtitle">Audience placement</span></th><td>Geographic only</td><td>Broad</td><td>Data-driven</td><td class="sipvertise-column"><div class="sip-cell"><span class="sip-star">✦</span><span>Contextual by venue/event</span></div></td></tr><tr><th scope="row"><span class="feat-title">CPM</span><span class="feat-subtitle">Cost efficiency</span></th><td>High</td><td>Medium</td><td>Varies</td><td class="sipvertise-column"><div class="sip-cell"><span class="sip-star">✦</span><span>Low with repeated views</span></div></td></tr></tbody></table></div></section>

<section id="seen-held" class="seen-held-section reveal" aria-labelledby="seen-held-title"><div class="seen-held-inner"><div class="seen-held-copy"><p class="seen-held-eyebrow">[ BUILT FOR REAL LIFE ]</p><h2 id="seen-held-title"><span class="shr-white">Seen.</span><br><span class="shr-white">Held.</span><br><span class="shr-yellow">Remembered.</span></h2></div><div class="seen-held-visual"><img src="/sipvertise-in-hand-lifestyle.png" alt="Woman walking through the city holding a Sipvertise branded bottle at golden hour" loading="lazy"></div></div></section>

<section id="how" class="how dark reveal"><div class="how-video"><img class="how-poster" src="/image.png" alt=""><video autoplay muted loop playsinline preload="auto"><source src="/Create_a_premium_cinematic_p%20(1)_erasio.mp4" type="video/mp4"></video></div><div class="how-content"><div class="how-title"><p class="eyebrow">[ HOW IT MOVES ]</p><h2>A campaign<br>people<br>can hold.</h2></div><div class="steps"><article><b>01</b><div><h3>Create</h3><p>A campaign designed for the bottle, not cropped onto it.</p></div></article><article><b>02</b><div><h3>Place</h3><p>A useful object puts the message directly into people's hands.</p></div></article><article><b>03</b><div><h3>Travel</h3><p>The bottle carries the brand through streets, venues and everyday moments.</p></div></article><article><b>04</b><div><h3>Measure</h3><p>Scans and visits give campaign data.</p></div></article></div></div></section>

<section id="where" class="ideal cream reveal" aria-labelledby="ideal-title"><div><p class="eyebrow">[ IDEAL FOR ]</p><h2 id="ideal-title">Put useful reach<br>where it works.</h2><p>Perfect for brands that want:</p><ul class="ideal-list"><li>Hyperlocal or regional awareness</li><li>Mass outreach at low cost</li><li>Youth engagement</li><li>Measurable offline + online campaigns</li><li>Visibility at high-footfall events</li></ul></div><div class="venue-list"><p class="eyebrow">[ VENUES ]</p><ul aria-label="Venues"><li>Gyms</li><li>Events</li><li>Workplaces</li><li>Parks</li><li>Colleges</li><li>Hotels</li></ul></div></section>

<section id="campaign-journey" class="client-journey dark reveal" aria-labelledby="campaign-journey-title"><div class="client-journey-header"><p class="eyebrow">[ CLIENT CAMPAIGN JOURNEY ]</p><h2 id="campaign-journey-title">From initial brief to<br><em>thousands of hands.</em></h2><p class="client-journey-lead">A seamless 5-step process designed to launch your branded water bottle advertising campaign effortlessly.</p></div><ol class="journey-timeline"><li class="journey-step-item"><span class="journey-step-marker" aria-hidden="true"></span><div class="journey-step-num">01</div><h3 class="journey-step-title">TELL US YOUR CAMPAIGN</h3><p class="journey-step-desc">Share your brand, campaign goal, event, audience, and requirements.</p></li><li class="journey-step-item"><span class="journey-step-marker" aria-hidden="true"></span><div class="journey-step-num">02</div><h3 class="journey-step-title">CHOOSE YOUR CAMPAIGN</h3><p class="journey-step-desc">Select the event, location, audience, quantity, and campaign period.</p></li><li class="journey-step-item"><span class="journey-step-marker" aria-hidden="true"></span><div class="journey-step-num">03</div><h3 class="journey-step-title">DESIGN YOUR BOTTLE</h3><p class="journey-step-desc">Create the branded bottle design and get client approval.</p></li><li class="journey-step-item"><span class="journey-step-marker" aria-hidden="true"></span><div class="journey-step-num">04</div><h3 class="journey-step-title">PRODUCE &amp; DISTRIBUTE</h3><p class="journey-step-desc">Produce the branded bottles and distribute them through the selected event or campaign.</p></li><li class="journey-step-item"><span class="journey-step-marker" aria-hidden="true"></span><div class="journey-step-num">05</div><h3 class="journey-step-title">REACH &amp; TRACK</h3><p class="journey-step-desc">Reach the target audience and track QR-based interaction or campaign performance where applicable.</p></li></ol></section>


<section id="faq" class="faq dark reveal" aria-labelledby="faq-title"><p class="eyebrow">[ GOOD TO KNOW ]</p><h2 id="faq-title">Frequently asked questions.</h2><div class="faq-list"><details><summary>What is in-hand advertising?</summary><p>Full-wrap printed water bottles that work as mobile billboards.</p></details><details><summary>How do people interact with the ad?</summary><p>Every bottle has a QR code that connects a real-world view to a measurable digital action.</p></details><details><summary>How is the audience targeted?</summary><p>By venue or event.</p></details><details><summary>What do you handle?</summary><p>From concept to printing, targeting to distribution.</p></details><details><summary>How do I start?</summary><p>Use the quote form, call us, or email us.</p></details></div></section>
<section id="start-campaign" class="start-a-campaign yellow reveal" aria-labelledby="start-campaign-title"><div class="start-campaign-layout"><div class="start-campaign-info"><p class="eyebrow">[ START A CAMPAIGN ]</p><h2 id="start-campaign-title">PUT YOUR BRAND<br>IN <em>EVERY HAND.</em></h2><p>Have a campaign in mind? Tell us what you need and our team will help you turn it into a branded bottle campaign.</p><ul class="start-campaign-perks"><li><span>✓</span> Direct physical engagement with zero ad-block</li><li><span>✓</span> Precision distribution across selected high-footfall venues</li><li><span>✓</span> Full end-to-end design, packaging &amp; QR integration</li></ul></div><div class="start-campaign-card"><h3>START A CAMPAIGN</h3><p class="start-campaign-card-sub">Fill out your brief and our team will prepare a custom proposal.</p><form id="start-campaign-form" class="start-campaign-form" novalidate><div class="form-grid"><label>COMPANY / BRAND NAME *<input name="company" placeholder="e.g. Acme Corp" required></label><label>CONTACT PERSON *<input name="contact_person" placeholder="Full name" required></label><label>EMAIL *<input name="email" type="email" placeholder="you@company.com" required></label><label>PHONE NUMBER *<input name="phone" type="tel" placeholder="+91 / +1 ..." required></label><label>CAMPAIGN TYPE<select name="campaign_type"><option value="">Loading campaign types...</option></select></label><label>ESTIMATED BOTTLE QUANTITY<select name="quantity"><option value="">Loading quantities...</option></select></label><label class="campaign-full-width">MESSAGE / CAMPAIGN DETAILS<textarea name="message" placeholder="Tell us about your brand goals, venue, target audience, or campaign ideas..."></textarea></label></div><button type="submit" class="campaign-submit-btn">START MY CAMPAIGN ↗</button><p class="form-status" aria-live="polite" role="status"></p></form></div></div></section>
</main>
<footer class="footer dark"><div><img class="brand-logo brand-logo--footer" src="/sipvertise-logo-badge.png" alt="Sipvertise"><p>Don't just advertise.<br><span>Sipvertise.</span></p></div><div><!-- TODO: Confirm this location line with the client; the supplied phone numbers use India's +91 country code. --><p>New York · London · Everywhere</p><a href="tel:+918129720508">+91 8129720508</a><a href="tel:+918281936307">+91 8281936307</a><a href="mailto:Hello@sipvertise.com">Hello@sipvertise.com</a><a href="https://www.sipvertise.com">www.sipvertise.com</a><a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM ↗</a><a href="#admin-leads-modal" id="open-admin-leads-btn" class="footer-admin-link">CAMPAIGN LEADS (ADMIN) ↗</a></div><div class="footer-health-widget" id="footer-health-widget"><div class="health-pill" id="api-health-pill" title="Backend API Health"><span class="health-dot health-checking"></span><span class="health-label">API Checking...</span></div><a class="back-top" href="#top">BACK TO TOP ↗</a></div><small>© 2026 SIPVERTISE. A BETTER KIND OF BILLBOARD.</small></footer>`

const productSection = document.querySelector('.product-scroll')
const productStage = productSection.querySelector('.product-stage')
productSection.classList.add('sv-scrub')
productStage.classList.add('sv-scrub__pin')
productSection.querySelector('.product-intro-line')?.remove()

const productVideo = productSection.querySelector('.bottle-sequence-source')
productVideo.id = 'svVideo'
productVideo.className = 'sv-scrub__video'
productVideo.querySelector('source')?.remove()
productVideo.src = VIDEO_SRC
productVideo.poster = '/image.png'
productVideo.preload = 'auto'
productVideo.muted = true
productVideo.playsInline = true
productVideo.controls = false
productVideo.tabIndex = -1
productVideo.setAttribute('aria-hidden', 'true')
productVideo.removeAttribute('autoplay')
productVideo.removeAttribute('loop')

const productCard = productSection.querySelector('.product-card')


const menuButton = document.querySelector('.menu')
const navigation = document.querySelector('#site-navigation')
menuButton.addEventListener('click', () => {
	const isOpen = navigation.classList.toggle('open')
	menuButton.setAttribute('aria-expanded', String(isOpen))
	menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu')
})
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
	navigation.classList.remove('open')
	menuButton.setAttribute('aria-expanded', 'false')
	menuButton.setAttribute('aria-label', 'Open menu')
}))

// Initialize dynamic Start a Campaign form
const startCampaignForm = document.querySelector('#start-campaign-form')
if (startCampaignForm) {
	initCampaignForm(startCampaignForm)
}

// Initialize Admin Leads modal and health status indicator
initAdminDashboard()
const healthWidget = document.querySelector('#api-health-pill')
if (healthWidget) {
	initHealthCheckIndicator(healthWidget)
}

// ─────────────────────────────────────────────────────────────────────────────

const counters = document.querySelectorAll('[data-counter]')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
	if (!entry.isIntersecting) return
	const counter = entry.target
	const target = Number(counter.dataset.value)
	const prefix = counter.dataset.prefix ?? ''
	const suffix = counter.dataset.suffix ?? ''
	if (reducedMotion) {
		counter.textContent = `${prefix}${target}${suffix}`
	} else {
		const start = performance.now()
		const duration = 1100
		const update = (now) => {
			const progress = Math.min((now - start) / duration, 1)
			const value = Math.round(target * (1 - (1 - progress) ** 3))
			counter.textContent = `${prefix}${value}${suffix}`
			if (progress < 1) requestAnimationFrame(update)
		}
		requestAnimationFrame(update)
	}
	counterObserver.unobserve(counter)
}), { threshold: 0.6 })
counters.forEach((counter) => counterObserver.observe(counter))

const revealObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add('in-view')
		}
	})
}, { threshold: 0.18 })

document.querySelectorAll('.reveal').forEach((section) => revealObserver.observe(section))

const motionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
	const video = entry.target.querySelector('video')
	entry.target.classList.toggle('is-visible', entry.isIntersecting)
	if (!entry.isIntersecting) {
		video?.pause()
		return
	}
	video?.play().catch(() => {})
}), { threshold: 0.2 })
document.querySelectorAll('.hero-art, .how-video, .formats-video-wrap').forEach((videoContainer) => motionObserver.observe(videoContainer))

document.querySelectorAll('.how-video video, .formats-video-wrap video').forEach((video) => {
	const container = video.parentElement
	video.addEventListener('playing', () => container.classList.add('is-playing'))
	video.addEventListener('pause', () => container.classList.remove('is-playing'))
	video.addEventListener('error', () => container.classList.remove('is-playing'))
})

const resumeVisibleVideos = () => {
	if (document.visibilityState !== 'visible') return
	document.querySelectorAll('.hero-art video, .how-video video, .formats-video-wrap video').forEach((video) => {
		const bounds = video.parentElement.getBoundingClientRect()
		if (bounds.bottom > 0 && bounds.top < window.innerHeight) video.play().catch(() => {})
	})
}

document.addEventListener('visibilitychange', resumeVisibleVideos)
window.addEventListener('pageshow', resumeVisibleVideos)

function setupBottleScroll() {
	const section = productSection
	const stage = productStage
	const canvasWrap = section.querySelector('.bottle-canvas-wrap')
	const canvas = canvasWrap.querySelector('canvas')
	const context = canvas.getContext('2d')
	const card = productCard
	const copy = section.querySelector('.product-copy')
	const heroHeadline = document.querySelector('.hero h1')
	const featureItems = [...section.querySelectorAll('.product-features li')]
	const featureImages = [...card.querySelectorAll('.product-card-images img')]
	const caption = section.querySelector('.product-caption')
	const captions = featureItems.map((item) => item.querySelector('strong').textContent)
	const poster = new Image()
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
	
	const FRAME_COUNT = 120
	const frames = new Array(FRAME_COUNT)
	let activeFrame = null
	let currentProgress = 0
	let scrollDistance = 1
	let dock = { x: 0, y: 0, scale: 1 }
	let frameRequest = 0
	let sectionReached = false
	let resizeObserver
	let disposed = false

	const preloadFrames = () => {
		for (let i = 0; i < FRAME_COUNT; i++) {
			const img = new Image()
			img.src = `/sipvertise/carton-frames/frame_${String(i).padStart(3, '0')}.webp`
			if (img.decode) {
				img.decode().then(() => {
					frames[i] = img
					if (i === 0 && !activeFrame) {
						activeFrame = img
						drawMainFrame()
					}
				}).catch(() => {
					frames[i] = img
					if (i === 0 && !activeFrame) {
						activeFrame = img
						drawMainFrame()
					}
				})
			} else {
				img.onload = () => {
					frames[i] = img
					if (i === 0 && !activeFrame) {
						activeFrame = img
						drawMainFrame()
					}
				}
			}
		}
	}
	preloadFrames()

	const getFrameForProgress = (progress) => {
		const videoProgress = Math.min(progress / VIDEO_END_PROGRESS, 1)
		const targetIndex = Math.min(FRAME_COUNT - 1, Math.floor(videoProgress * (FRAME_COUNT - 1)))
		if (frames[targetIndex]?.complete && frames[targetIndex]?.naturalWidth) {
			activeFrame = frames[targetIndex]
			return activeFrame
		}
		// Fallback to nearest adjacent loaded frame within a small neighborhood
		for (let offset = 1; offset < 10; offset++) {
			const prev = targetIndex - offset
			if (prev >= 0 && frames[prev]?.complete && frames[prev]?.naturalWidth) {
				activeFrame = frames[prev]
				return activeFrame
			}
			const next = targetIndex + offset
			if (next < FRAME_COUNT && frames[next]?.complete && frames[next]?.naturalWidth) {
				activeFrame = frames[next]
				return activeFrame
			}
		}
		return activeFrame
	}

	const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))
	const setFeature = (index) => {
		const activeIndex = Math.max(0, Math.min(featureItems.length - 1, index))
		featureItems.forEach((item, itemIndex) => {
			if (itemIndex === activeIndex) item.setAttribute('aria-current', 'step')
			else item.removeAttribute('aria-current')
		})
		if (caption) caption.textContent = captions[activeIndex]
		featureImages.forEach((img, imgIndex) => {
			if (imgIndex === activeIndex) img.classList.add('is-active')
			else img.classList.remove('is-active')
		})
	}

	const drawCover = (targetCanvas, targetContext, source, sourceWidth, sourceHeight) => {
		if (!sourceWidth || !sourceHeight || !targetCanvas.width || !targetCanvas.height) return
		const scale = Math.max(targetCanvas.width / sourceWidth, targetCanvas.height / sourceHeight)
		const width = sourceWidth * scale
		const height = sourceHeight * scale
		targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
		targetContext.drawImage(source, (targetCanvas.width - width) / 2, (targetCanvas.height - height) / 2, width, height)
	}

	const drawMainFrame = () => {
		const frame = getFrameForProgress(currentProgress)
		if (frame && frame.naturalWidth) {
			drawCover(canvas, context, frame, frame.naturalWidth, frame.naturalHeight)
		} else if (poster.complete && poster.naturalWidth) {
			drawCover(canvas, context, poster, poster.naturalWidth, poster.naturalHeight)
		}
	}

	const measureLayout = () => {
		const mobile = window.matchMedia('(max-width: 767px)').matches
		section.style.setProperty('--sv-scroll-length', `${mobile ? MOBILE_SCROLL_LENGTH_VH : SCROLL_LENGTH_VH}vh`)
		const stageWidth = stage.clientWidth
		const stageHeight = stage.clientHeight
		const dpr = Math.min(window.devicePixelRatio || 1, 2)
		canvas.width = Math.round(stageWidth * dpr)
		canvas.height = Math.round(stageHeight * dpr)
		context.setTransform(1, 0, 0, 1, 0, 0)
		scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight)
		if (!reducedMotion.matches && stageWidth && stageHeight) {
			card.style.aspectRatio = ''
			const stageBounds = stage.getBoundingClientRect()
			const cardBounds = card.getBoundingClientRect()
			dock = {
				x: cardBounds.left + cardBounds.width / 2 - (stageBounds.left + stageBounds.width / 2),
				y: cardBounds.top + cardBounds.height / 2 - (stageBounds.top + stageBounds.height / 2),
				scale: cardBounds.width / stageWidth,
			}
		} else {
			card.style.aspectRatio = ''
		}
		drawMainFrame()
	}

	const setHeroVisibility = (sectionBounds) => {
		const pinned = !reducedMotion.matches && sectionBounds.top <= 0
		heroHeadline.style.opacity = pinned ? '0' : ''
		heroHeadline.style.pointerEvents = pinned ? 'none' : ''
	}

	featureItems.forEach((item, index) => {
		item.addEventListener('mouseenter', () => {
			setFeature(index)
		})
		item.addEventListener('click', () => {
			setFeature(index)
			const targetProgress = VIDEO_END_PROGRESS + ((index + 0.5) / featureItems.length) * (1 - VIDEO_END_PROGRESS)
			const targetScroll = section.offsetTop + targetProgress * scrollDistance
			if (window.lenis) {
				window.lenis.scrollTo(targetScroll, { duration: 1.2 })
			} else {
				window.scrollTo({ top: targetScroll, behavior: 'smooth' })
			}
		})
	})

	const updateStage = (progress) => {
		// Keep canvas centered in place - no downward falling or shift into the card
		canvasWrap.style.transform = 'none'

		// Smooth cinematic crossfade between 0.46 and 0.60
		const fadeStart = 0.46
		const fadeEnd = VIDEO_END_PROGRESS
		const fade = clamp((progress - fadeStart) / (fadeEnd - fadeStart))
		const easedFade = fade * fade * (3 - 2 * fade)

		const canvasOpacity = clamp(1 - easedFade)
		canvasWrap.style.opacity = String(canvasOpacity)
		canvasWrap.style.visibility = canvasOpacity > 0 ? 'visible' : 'hidden'

		const contentOpacity = clamp(easedFade)
		copy.style.opacity = String(contentOpacity)
		copy.style.visibility = contentOpacity > 0 ? 'visible' : 'hidden'
		card.style.opacity = String(contentOpacity)
		card.style.visibility = contentOpacity > 0 ? 'visible' : 'hidden'

		section.classList.toggle('is-docked', progress >= fadeStart)
		section.classList.toggle('is-final', progress >= VIDEO_END_PROGRESS)
		if (progress < VIDEO_END_PROGRESS) {
			setFeature(0)
		} else {
			const featureProgress = clamp((progress - VIDEO_END_PROGRESS) / (1 - VIDEO_END_PROGRESS))
			setFeature(Math.min(featureItems.length - 1, Math.floor(featureProgress * featureItems.length)))
		}
	}

	const scheduleFrame = () => {
		if (!disposed && !reducedMotion.matches && !frameRequest) frameRequest = requestAnimationFrame(tick)
	}

	function tick() {
		frameRequest = 0
		if (disposed || reducedMotion.matches) return
		const sectionBounds = section.getBoundingClientRect()
		setHeroVisibility(sectionBounds)
		// Hide canvas until the section actually scrolls into pinned range
		if (!sectionReached && sectionBounds.top > window.innerHeight * 0.1) {
			canvasWrap.style.opacity = '0'
			canvasWrap.style.visibility = 'hidden'
			scheduleFrame()
			return
		}
		sectionReached = true
		const targetProgress = clamp(-sectionBounds.top / scrollDistance)
		currentProgress += (targetProgress - currentProgress) * SMOOTHING
		if (Math.abs(targetProgress - currentProgress) < 0.0008) currentProgress = targetProgress
		updateStage(currentProgress)
		drawMainFrame()
		const pendingProgress = Math.abs(targetProgress - currentProgress) >= 0.0008
		if (pendingProgress) scheduleFrame()
	}

	const handleMotionChange = () => {
		if (frameRequest) cancelAnimationFrame(frameRequest)
		frameRequest = 0
		if (reducedMotion.matches) {
			section.classList.add('is-settled', 'is-final')
			currentProgress = 1
			setFeature(featureItems.length - 1)
			updateStage(1)
			drawMainFrame()
		} else {
			section.classList.remove('is-settled', 'is-final')
			currentProgress = 0
			measureLayout()
			scheduleFrame()
		}
	}
	const handleResize = () => {
		measureLayout()
		if (reducedMotion.matches) {
			section.classList.add('is-settled', 'is-final')
			currentProgress = 1
			updateStage(1)
			drawMainFrame()
		} else {
			scheduleFrame()
		}
	}
	const handleVisibility = () => {
		if (document.visibilityState === 'visible') scheduleFrame()
		else if (frameRequest) {
			cancelAnimationFrame(frameRequest)
			frameRequest = 0
		}
	}
	const cleanup = () => {
		disposed = true
		if (frameRequest) cancelAnimationFrame(frameRequest)
		window.removeEventListener('scroll', scheduleFrame)
		if (window.lenis) window.lenis.off('scroll', scheduleFrame)
		window.removeEventListener('resize', handleResize)
		window.removeEventListener('pagehide', cleanup)
		document.removeEventListener('visibilitychange', handleVisibility)
		reducedMotion.removeEventListener('change', handleMotionChange)
		resizeObserver.disconnect()
	}

	poster.src = '/image.png'
	poster.onload = drawMainFrame
	window.addEventListener('scroll', scheduleFrame, { passive: true })
	if (window.lenis) window.lenis.on('scroll', scheduleFrame)
	window.addEventListener('resize', handleResize, { passive: true })
	document.addEventListener('visibilitychange', handleVisibility)
	window.addEventListener('pagehide', cleanup, { once: true })
	reducedMotion.addEventListener('change', handleMotionChange)
	resizeObserver = new ResizeObserver(handleResize)
	resizeObserver.observe(stage)
	resizeObserver.observe(card)
	if (reducedMotion.matches) handleMotionChange()
	else {
		measureLayout()
		scheduleFrame()
	}
}

setupBottleScroll()

const whyCards = document.querySelectorAll('.why-card');
const whyImages = document.querySelectorAll('.why-sticky-img');

if (whyCards.length > 0 && whyImages.length > 0) {
	const whyObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const index = entry.target.dataset.index;
				whyImages.forEach((img, i) => {
					if (i == index) {
						img.classList.add('is-active');
					} else {
						img.classList.remove('is-active');
					}
				});
			}
		});
	}, {
		rootMargin: '-30% 0px -50% 0px',
		threshold: 0
	});

	whyCards.forEach(card => whyObserver.observe(card));
}

/* =====================================================
   CINEMATIC SCROLL ANIMATION ENGINE
   ===================================================== */

// — Scroll progress bar —
const progressWrap = document.createElement('div')
progressWrap.className = 'cin-progress'
progressWrap.innerHTML = '<div class="cin-progress__bar"></div>'
document.body.prepend(progressWrap)
const progressBar = progressWrap.querySelector('.cin-progress__bar')
const updateProgressBar = () => {
	const max = document.documentElement.scrollHeight - window.innerHeight
	const pct = max > 0 ? (window.scrollY / max) * 100 : 0
	progressBar.style.width = pct + '%'
}
window.addEventListener('scroll', updateProgressBar, { passive: true })
if (window.lenis) window.lenis.on('scroll', updateProgressBar)

// — IntersectionObserver factory —
const makeObserver = (threshold = 0.12, rootMargin = '0px 0px -48px 0px') =>
	new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('cin-visible')
			}
		})
	}, { threshold, rootMargin })

const cinObs = makeObserver()
const cinObsEarly = makeObserver(0.05, '0px 0px -16px 0px')

// — Apply animations to elements —
const app = document.querySelector('#app')

// Eyebrows — clip wipe from left
app.querySelectorAll('.eyebrow').forEach(el => {
	if (el.closest('.product-scroll') || el.closest('.hero')) return
	el.classList.add('cin-eyebrow')
	cinObs.observe(el)
})

// Section headings — slide up + fade
app.querySelectorAll('h2').forEach(el => {
	if (el.closest('.product-scroll') || el.closest('.hero')) return
	el.classList.add('cin-heading')
	cinObs.observe(el)
})

// Sub-headings / h3 inside sections
app.querySelectorAll('.why-brands-header h3, .client-journey-header h3').forEach(el => {
	el.classList.add('cin-heading')
	cinObs.observe(el)
})

// Lead text — fade up with delay
app.querySelectorAll('.why-brands-lead, .client-journey-lead, .start-campaign-info p, .comparison-header p').forEach(el => {
	el.classList.add('cin-lead')
	cinObs.observe(el)
})

// Left panels — slide from left
app.querySelectorAll('.why-brands-header, .how-content, .start-campaign-info, .ideal > div:first-child').forEach(el => {
	el.classList.add('cin-from-left')
	cinObsEarly.observe(el)
})

// Right panels — slide from right
app.querySelectorAll('.why-brands-right, .how-video, .ideal .venue-list').forEach(el => {
	el.classList.add('cin-from-right')
	cinObsEarly.observe(el)
})

// Card grids — stagger children
app.querySelectorAll('.why-brands-grid, .stats-grid, .steps, .problem-grid, .faq-list, .start-campaign-perks').forEach(el => {
	el.classList.add('cin-stagger')
	cinObs.observe(el)
})

// Timeline steps — stagger
app.querySelectorAll('.journey-timeline').forEach(el => {
	el.classList.add('cin-stagger-slow')
	cinObs.observe(el)
})

// Start campaign card — scale in
app.querySelectorAll('.start-campaign-card').forEach(el => {
	el.classList.add('cin-scale')
	cinObs.observe(el)
})

// — Parallax on hero art —
const heroArt = document.querySelector('.hero-art')
if (heroArt) {
	const updateHeroParallax = () => {
		heroArt.style.transform = `translateY(${window.scrollY * 0.28}px)`
	}
	window.addEventListener('scroll', updateHeroParallax, { passive: true })
	if (window.lenis) window.lenis.on('scroll', updateHeroParallax)
}

// — Smooth Anchor Link Navigation —
document.addEventListener('click', (e) => {
	const link = e.target.closest('a[href^="#"]')
	if (!link) return
	const href = link.getAttribute('href')
	if (href && href.length > 1) {
		const target = document.querySelector(href)
		if (target) {
			e.preventDefault()
			if (window.lenis) {
				window.lenis.scrollTo(target, { duration: 1.2 })
			} else {
				target.scrollIntoView({ behavior: 'smooth' })
			}
		}
	}
})

// — Section number counters (enhanced) —
document.querySelectorAll('[data-counter]').forEach(el => {
	const target = +el.dataset.value
	const suffix = el.dataset.suffix || ''
	const prefix = el.dataset.prefix || ''
	let started = false
	new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting && !started) {
			started = true
			const duration = 1600
			const start = performance.now()
			const tick = (now) => {
				const p = Math.min((now - start) / duration, 1)
				const ease = 1 - Math.pow(1 - p, 4)
				el.textContent = prefix + Math.round(ease * target) + suffix
				if (p < 1) requestAnimationFrame(tick)
			}
			requestAnimationFrame(tick)
		}
	}, { threshold: 0.5 }).observe(el)
})
