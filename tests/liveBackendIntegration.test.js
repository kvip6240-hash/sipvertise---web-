import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  fetchCampaignOptions,
  submitCampaign,
  fetchCampaignLeads,
  checkHealth
} from '../src/services/campaignApi.js'

describe('Live Backend Integration Tests (http://localhost:5000)', () => {
  let isBackendLive = false

  it('1. GET /api/health against live backend', async () => {
    process.env.VITE_API_BASE_URL = 'http://localhost:5000'
    try {
      const health = await checkHealth({ timeoutMs: 2000 })
      assert.strictEqual(health.status, 'OK')
      assert.strictEqual(health.service, 'Sipvertise Campaign API')
      isBackendLive = true
    } catch (err) {
      console.warn('Backend not currently reachable at http://localhost:5000:', err.message)
    }
  })

  it('2. GET /api/campaigns/options returns real dynamic campaign types & quantities', async (t) => {
    if (!isBackendLive) {
      t.skip('Backend not running on port 5000')
      return
    }

    const options = await fetchCampaignOptions()
    assert.ok(Array.isArray(options.campaignTypes))
    assert.ok(options.campaignTypes.includes('Event / Conference'))
    assert.ok(options.campaignTypes.includes('Gym & Fitness'))

    assert.ok(Array.isArray(options.bottleQuantities))
    assert.ok(options.bottleQuantities.includes('1,000 - 5,000'))
  })

  it('3. POST /api/campaigns validates required fields on live backend', async (t) => {
    if (!isBackendLive) {
      t.skip('Backend not running on port 5000')
      return
    }

    await assert.rejects(
      async () => {
        await submitCampaign({
          companyName: '',
          email: 'invalid'
        })
      },
      (err) => {
        assert.strictEqual(err.status, 400)
        assert.ok(err.errors.length > 0)
        return true
      }
    )
  })

  it('4. POST /api/campaigns submits real lead and receives leadId & notifications', async (t) => {
    if (!isBackendLive) {
      t.skip('Backend not running on port 5000')
      return
    }

    const timestamp = Date.now()
    const result = await submitCampaign({
      companyName: `Automated Test Brand ${timestamp}`,
      contactPerson: 'QA Bot',
      email: `qa.bot+${timestamp}@example.com`,
      phoneNumber: '+919876543210',
      campaignType: 'Campus / College',
      bottleQuantity: '1,000 - 5,000',
      message: 'Automated integration test payload'
    })

    assert.strictEqual(result.success, true)
    assert.ok(result.leadId)
    assert.ok(result.whatsappDirectUrl)
    assert.ok(result.notifications)
  })

  it('5. GET /api/campaigns retrieves real stored leads for admin dashboard', async (t) => {
    if (!isBackendLive) {
      t.skip('Backend not running on port 5000')
      return
    }

    const result = await fetchCampaignLeads()
    assert.strictEqual(result.success, true)
    assert.ok(Array.isArray(result.leads))
    assert.ok(result.leads.length > 0)
  })
})
