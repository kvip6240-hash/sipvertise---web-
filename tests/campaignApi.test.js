import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import {
  getApiBaseUrl,
  fetchCampaignOptions,
  submitCampaign,
  fetchCampaignLeads,
  checkHealth
} from '../src/services/campaignApi.js'

describe('Sipvertise Campaign API Client (Unit & Mocked Tests)', () => {
  let mockServer
  let mockPort

  before(async () => {
    // Spin up an ephemeral local mock server to deterministically test API client behavior
    await new Promise((resolve) => {
      mockServer = http.createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:${mockPort}`)

        if (url.pathname === '/api/campaigns/options' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            success: true,
            campaignTypes: ['Event / Conference', 'Campus / College', 'Gym & Fitness'],
            bottleQuantities: ['1,000 - 5,000', '5,000 - 25,000']
          }))
        }

        if (url.pathname === '/api/campaigns' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              if (!parsed.companyName || !parsed.email) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({
                  success: false,
                  message: 'Validation failed. Please verify required fields.',
                  errors: ['Company / Brand Name is required.', 'Email is required.']
                }))
              }

              if (parsed.companyName === 'DuplicateCo') {
                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({
                  success: true,
                  duplicate: true,
                  message: 'Your campaign inquiry was already received! Our team is currently reviewing it.',
                  leadId: 'lead_mock_dup_123',
                  whatsappDirectUrl: 'https://wa.me/919876543210?text=duplicate'
                }))
              }

              if (parsed.companyName === 'ServerErrorCo') {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({
                  success: false,
                  message: 'Internal server error occurred.'
                }))
              }

              res.writeHead(201, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({
                success: true,
                message: 'Campaign inquiry submitted successfully! Our team will contact you shortly.',
                leadId: 'lead_mock_success_456',
                data: parsed,
                notifications: {
                  email: { success: true },
                  whatsapp: { success: false, status: 'unconfigured' }
                },
                whatsappDirectUrl: 'https://wa.me/919876543210?text=test'
              }))
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ message: 'Malformed JSON' }))
            }
          })
          return
        }

        if (url.pathname === '/api/campaigns' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            success: true,
            total: 2,
            data: [
              {
                id: 'lead_1',
                companyName: 'Acme Corp',
                contactPerson: 'Alice',
                email: 'alice@acme.com',
                phoneNumber: '+919876543210',
                campaignType: 'Campus / College',
                bottleQuantity: '5,000 - 25,000'
              },
              {
                id: 'lead_2',
                companyName: 'Fitness Pro',
                contactPerson: 'Bob',
                email: 'bob@fitness.com',
                phoneNumber: '+919876543211',
                campaignType: 'Gym & Fitness',
                bottleQuantity: '1,000 - 5,000'
              }
            ]
          }))
        }

        if (url.pathname === '/api/health' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({
            status: 'OK',
            service: 'Sipvertise Campaign API',
            uptime: 120,
            timestamp: new Date().toISOString()
          }))
        }

        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Not found' }))
      })

      mockServer.listen(0, '127.0.0.1', () => {
        mockPort = mockServer.address().port
        process.env.VITE_API_BASE_URL = `http://127.0.0.1:${mockPort}`
        resolve()
      })
    })
  })

  after(async () => {
    if (mockServer) {
      await new Promise(resolve => mockServer.close(resolve))
    }
  })

  it('1. getApiBaseUrl handles trailing slashes and environment variable', () => {
    const url = getApiBaseUrl()
    assert.strictEqual(url, `http://127.0.0.1:${mockPort}`)
    assert.ok(!url.endsWith('/'), 'Should not have trailing slash')
  })

  it('2. fetchCampaignOptions parses campaign types and quantities', async () => {
    const options = await fetchCampaignOptions()
    assert.ok(Array.isArray(options.campaignTypes), 'campaignTypes should be an array')
    assert.ok(Array.isArray(options.bottleQuantities), 'bottleQuantities should be an array')
    assert.strictEqual(options.campaignTypes.length, 3)
    assert.strictEqual(options.bottleQuantities.length, 2)
  })

  it('3. submitCampaign submits valid brief and returns leadId and notifications', async () => {
    const res = await submitCampaign({
      companyName: 'Test Brand',
      contactPerson: 'Charlie',
      email: 'charlie@test.com',
      phoneNumber: '+919876543210',
      campaignType: 'Event / Conference',
      bottleQuantity: '1,000 - 5,000',
      message: 'Need bottles for event'
    })

    assert.strictEqual(res.success, true)
    assert.strictEqual(res.leadId, 'lead_mock_success_456')
    assert.strictEqual(res.data.companyName, 'Test Brand')
    assert.ok(res.whatsappDirectUrl.includes('wa.me'))
  })

  it('4. submitCampaign handles validation errors with error list', async () => {
    await assert.rejects(
      async () => {
        await submitCampaign({
          companyName: '',
          email: ''
        })
      },
      (err) => {
        assert.strictEqual(err.status, 400)
        assert.ok(Array.isArray(err.errors))
        assert.strictEqual(err.errors.length, 2)
        return true
      }
    )
  })

  it('5. submitCampaign handles duplicate submission response', async () => {
    const res = await submitCampaign({
      companyName: 'DuplicateCo',
      contactPerson: 'Same Person',
      email: 'dup@example.com',
      phoneNumber: '+919876543210'
    })

    assert.strictEqual(res.success, true)
    assert.strictEqual(res.duplicate, true)
    assert.ok(res.message.includes('already received'))
  })

  it('6. submitCampaign handles server 500 error gracefully', async () => {
    await assert.rejects(
      async () => {
        await submitCampaign({
          companyName: 'ServerErrorCo',
          email: 'err@example.com'
        })
      },
      (err) => {
        assert.strictEqual(err.status, 500)
        return true
      }
    )
  })

  it('7. fetchCampaignLeads fetches leads array for admin dashboard', async () => {
    const res = await fetchCampaignLeads()
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.total, 2)
    assert.strictEqual(res.leads.length, 2)
    assert.strictEqual(res.leads[0].companyName, 'Acme Corp')
    assert.strictEqual(res.leads[1].companyName, 'Fitness Pro')
  })

  it('8. checkHealth returns OK status and uptime', async () => {
    const health = await checkHealth()
    assert.strictEqual(health.status, 'OK')
    assert.strictEqual(health.service, 'Sipvertise Campaign API')
    assert.ok(typeof health.uptime === 'number')
  })

  it('9. checkHealth handles network timeout via AbortController', async () => {
    // Point to non-routable blackhole IP with short timeout to test AbortController
    process.env.VITE_API_BASE_URL = 'http://10.255.255.1'
    await assert.rejects(
      async () => {
        await checkHealth({ timeoutMs: 150 })
      },
      (err) => {
        assert.ok(err.status === 408 || err.message.includes('timed out') || err.name === 'AbortError')
        return true
      }
    )
    process.env.VITE_API_BASE_URL = `http://127.0.0.1:${mockPort}`
  })
})
