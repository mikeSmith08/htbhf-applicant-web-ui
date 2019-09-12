require('dotenv').config()

const test = require('tape')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const TEST_FIXTURES = require('./test-fixtures.json')
const { standardisePostcode } = require('./postcode')
const { states } = require('../../common/state-machine')

const errorSpy = sinon.spy()
const logger = { error: errorSpy }
const request = sinon.stub()
const isEmpty = sinon.stub()
const validationResult = () => ({ isEmpty })
const auditSuccessfulPostcodeLookup = sinon.stub()
const auditFailedPostcodeLookup = sinon.stub()
const auditInvalidPostcodeLookup = sinon.stub()

const { behaviourForPost, behaviourForGet } = proxyquire(
  './postcode', {
    'request-promise': request,
    'express-validator': { validationResult },
    '../../../../logger': { logger },
    './os-places': { auditSuccessfulPostcodeLookup, auditFailedPostcodeLookup, auditInvalidPostcodeLookup }
  }
)

const config = { environment: { OS_PLACES_API_KEY: '123', GA_TRACKING_ID: 'UA-133839203-1', GOOGLE_ANALYTICS_URI: 'http://localhost:8150/collect' } }

const resetStubs = () => {
  request.reset()
  isEmpty.reset()
  errorSpy.resetHistory()
}

test('behaviourForPost() handles successful address lookup', async (t) => {
  // Set return values for stubs
  isEmpty.returns(true)
  request.resolves(TEST_FIXTURES)

  const req = {
    headers: { 'x-forwarded-for': '100.200.0.45' },
    body: { postcode: 'BS7 8EE' },
    session: { id: 'skdjfhs-sdfnks-sdfhbsd' }
  }
  const res = {}
  const next = sinon.spy()

  const expectedAddresses = [
    {
      ADDRESS: 'Alan Jeffery Engineering, 1, Valley Road, Plymouth',
      ORGANISATION_NAME: 'Alan Jeffery Engineering',
      BUILDING_NUMBER: '1',
      THOROUGHFARE_NAME: 'Valley Road',
      DEPENDENT_THOROUGHFARE_NAME: 'Upper Valley Road',
      POST_TOWN: 'Plymouth',
      POSTCODE: 'PL7 1RF',
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'City Of Plymouth'
    }, {
      ADDRESS: 'Dulux Decorator Centre, 2, Valley Road, Plymouth',
      ORGANISATION_NAME: 'Dulux Decorator Centre',
      BUILDING_NUMBER: '2',
      THOROUGHFARE_NAME: 'Valley Road',
      DEPENDENT_THOROUGHFARE_NAME: 'Upper Valley Road',
      POST_TOWN: 'Plymouth',
      POSTCODE: 'PL7 1RF',
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'City Of Plymouth'
    }, {
      ADDRESS: 'Mill Autos, 3, Valley Road, Plymouth',
      ORGANISATION_NAME: 'Mill Autos',
      BUILDING_NUMBER: '3',
      THOROUGHFARE_NAME: 'Valley Road',
      DEPENDENT_THOROUGHFARE_NAME: 'Upper Valley Road',
      POST_TOWN: 'Plymouth',
      POSTCODE: 'PL7 1RF',
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'City Of Plymouth'
    }, {
      ADDRESS: 'Goat Hill Farm, 2, Troll Bridge, Goat Hill, Slaithwaite, Slaith, Huddersfield',
      ORGANISATION_NAME: 'Goat Hill Farm',
      BUILDING_NUMBER: '2',
      THOROUGHFARE_NAME: 'Goat Hill',
      DEPENDENT_THOROUGHFARE_NAME: 'Troll Bridge',
      DOUBLE_DEPENDENT_LOCALITY: 'Slaithwaite',
      DEPENDENT_LOCALITY: 'Slaith',
      POST_TOWN: 'Huddersfield',
      POSTCODE: 'HD7 5UZ',
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'Kirklees'
    }, {
      ADDRESS: '10a, Mayfield Avenue, Weston-Super-Mare',
      BUILDING_NAME: '10a',
      THOROUGHFARE_NAME: 'Mayfield Avenue',
      POST_TOWN: 'Weston-Super-Mare',
      POSTCODE: 'BS22 6AA',
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'North Somerset'
    }
  ]

  await behaviourForPost(config)(req, res, next)

  t.deepEqual(req.session.postcodeLookupResults, expectedAddresses, 'adds postcode lookup results to session')
  t.deepEqual(auditSuccessfulPostcodeLookup.getCall(0).args, [config, req, 44], 'should audit successful postcode with correct parameters')
  t.equal(next.called, true, 'calls next()')

  resetStubs()
  t.end()
})

test('behaviourForPost() handles address lookup error', async (t) => {
  // Set return values for stubs
  isEmpty.returns(true)
  request.rejects(new Error('error'))

  const req = {
    headers: { 'x-forwarded-for': '100.200.0.45' },
    body: { postcode: 'BS7 8EE' },
    session: { id: 'skdjfhs-sdfnks-sdfhbsd' }
  }
  const res = {}
  const next = sinon.spy()

  await behaviourForPost(config)(req, res, next)

  t.deepEqual(req.session.postcodeLookupResults, undefined, 'does not add postcode lookup results to session')
  t.equal(req.session.postcodeLookupError, true, 'sets postcode lookup error on session')
  t.equal(next.called, true, 'calls next()')
  t.equal(errorSpy.getCall(0).args[0], 'Error looking up address for postcode: Error: error', 'logs an error')
  t.deepEqual(auditFailedPostcodeLookup.getCall(0).args, [config, req], 'should audit failed postcode with correct parameters')

  resetStubs()
  t.end()
})

test('behaviourForPost() does not call os places when there are validation errors', async (t) => {
  // Set return values for stubs
  isEmpty.returns(false)

  const req = {}
  const res = {}
  const next = () => {}

  await behaviourForPost(config)(req, res, next)
  t.equal(request.called, false, 'should not call os places')
  resetStubs()
  t.end()
})

test('behaviourForPost() handles 400 response from OS places API', async (t) => {
  // Set return values for stubs
  const osPlacesError = new Error('Os places error')
  osPlacesError.statusCode = 400
  request.rejects(osPlacesError)
  isEmpty.returns(true)

  const req = {
    headers: { 'x-forwarded-for': '100.200.0.45' },
    body: { postcode: 'BS14TM' },
    session: { id: 'skdjfhs-sdfnks-sdfhbsd' }
  }
  const res = {}
  const next = sinon.spy()

  await behaviourForPost(config)(req, res, next)

  t.deepEqual(req.session.postcodeLookupResults, [], 'adds empty postcode lookup results to session')
  t.equal(req.session.postcodeLookupError, undefined, 'does not set postcode lookup error on session')
  t.deepEqual(auditInvalidPostcodeLookup.getCall(0).args, [config, req], 'should audit invalid postcode with correct parameters')
  t.equal(next.called, true, 'calls next()')

  resetStubs()
  t.end()
})

test('standardisePostcode() standardises the postcode', (t) => {
  t.equal(standardisePostcode('AB1 1AB'), 'AB11AB', 'should removes space from postcode')
  t.equal(standardisePostcode('AB1      1AB'), 'AB11AB', 'should remove multiple spaces from postcode')
  t.equal(standardisePostcode('   AB1 1AB '), 'AB11AB', 'should remove spaces from around postcode')
  t.equal(standardisePostcode('ab11ab'), 'AB11AB', 'should upper case postcode')
  t.end()
})

test(`behaviourForGet() sets state to ${states.IN_PROGRESS} and resets postcodeLookupError`, (t) => {
  const req = {
    session: {
      state: states.IN_REVIEW,
      postcodeLookupError: true
    }
  }

  const res = {}
  const next = sinon.spy()

  behaviourForGet()(req, res, next)

  t.equal(next.called, true, 'calls next()')
  t.equal(req.session.state, states.IN_PROGRESS, `updates state to ${states.IN_PROGRESS}`)
  t.equal(req.session.postcodeLookupError, undefined, 'resets postcodeLookupError')
  t.end()
})