import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isValidEmail, isValidPhone } from '../src/components/campaignForm.js'

describe('Start a Campaign Form Validation Rules', () => {
  it('1. isValidEmail correctly validates email formats', () => {
    assert.strictEqual(isValidEmail('user@domain.com'), true)
    assert.strictEqual(isValidEmail('first.last@sub.company.org'), true)
    assert.strictEqual(isValidEmail('contact+tag@service.io'), true)

    assert.strictEqual(isValidEmail(''), false)
    assert.strictEqual(isValidEmail('plainaddress'), false)
    assert.strictEqual(isValidEmail('missingdomain@'), false)
    assert.strictEqual(isValidEmail('@missinguser.com'), false)
    assert.strictEqual(isValidEmail('user@nodot'), false)
    assert.strictEqual(isValidEmail('user name@domain.com'), false)
  })

  it('2. isValidPhone correctly validates phone numbers (7 to 15 digits)', () => {
    assert.strictEqual(isValidPhone('+91 98765 43210'), true)
    assert.strictEqual(isValidPhone('+1 (555) 019-2834'), true)
    assert.strictEqual(isValidPhone('9876543210'), true)
    assert.strictEqual(isValidPhone('+44 20 7946 0958'), true)
    assert.strictEqual(isValidPhone('1234567'), true) // 7 digits (minimum)
    assert.strictEqual(isValidPhone('123456789012345'), true) // 15 digits (maximum)

    assert.strictEqual(isValidPhone(''), false)
    assert.strictEqual(isValidPhone('123456'), false) // 6 digits (too short)
    assert.strictEqual(isValidPhone('1234567890123456'), false) // 16 digits (too long)
    assert.strictEqual(isValidPhone('abc-def-ghij'), false) // No digits
  })
})
