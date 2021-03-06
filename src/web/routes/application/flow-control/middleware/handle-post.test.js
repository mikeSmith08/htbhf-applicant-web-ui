const test = require('tape')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const states = require('../states')
const { buildSessionForJourney, getNextAllowedPathForJourney } = require('../test-utils')

const defaultValidator = {
  'express-validator': {
    validationResult: () => ({
      isEmpty: () => true
    })
  }
}

test('handlePost() should add errors and claim to locals if errors exist', (t) => {
  const errors = ['error']

  const { handlePost } = proxyquire('./handle-post', {
    'express-validator': {
      validationResult: () => ({
        isEmpty: () => false,
        array: () => errors
      })
    }
  })

  const steps = [{ path: '/first', next: () => '/second' }, { path: '/second' }]
  const journey = { name: 'apply', steps }
  const step = steps[0]
  const claim = { firstName: 'Joe', lastName: 'Bloggs' }
  const req = { body: { lastName: '' } }
  const res = { locals: { claim } }
  const next = sinon.spy()

  handlePost(journey, step)(req, res, next)

  t.deepEqual(res.locals.errors, errors, 'it should add errors to locals')
  t.deepEqual(res.locals.claim, { firstName: 'Joe', lastName: '' }, 'it should override claim properties with body properties')
  t.equal(next.called, true, 'it should call next()')
  t.end()
})

test('handlePost() adds body to the session if no errors exist', (t) => {
  const { handlePost } = proxyquire('./handle-post', { ...defaultValidator })

  const steps = [{ path: '/first', next: () => '/second' }, { path: '/second' }]
  const journey = { name: 'apply', steps }
  const step = steps[0]
  const req = {
    session: {
      claim: {
        other: 'claim data'
      }
    },
    body: {
      new: 'claim data'
    }
  }

  const next = sinon.spy()

  const expected = {
    other: 'claim data',
    new: 'claim data'
  }

  handlePost(journey, step)(req, {}, next)

  t.deepEqual(req.session.claim, expected, 'it should add body to session')
  t.equal(next.called, true, 'it should call next()')
  t.end()
})

test('handlePost() calls next() with error on error', (t) => {
  const { handlePost } = proxyquire('./handle-post', {
    'express-validator': {
      validationResult: () => ({
        isEmpty: () => { throw new Error('error') },
        array: () => []
      })
    }
  })

  const steps = [{ path: '/first', next: () => '/second' }, { path: '/second' }]
  const journey = { steps }
  const step = steps[0]
  const req = {
    session: {
      claim: {}
    },
    body: {}
  }

  const res = { locals: {} }
  const next = sinon.spy()

  handlePost(journey, step)(req, res, next)

  t.equal(next.calledWith(sinon.match.instanceOf(Error)), true, 'it should call next() with error')
  t.end()
})

test('handlePost() adds next allowed step to session', (t) => {
  const { handlePost } = proxyquire('./handle-post', { ...defaultValidator })

  const steps = [{ path: '/first', next: () => '/second' }, { path: '/second' }]
  const journey = { name: 'apply', steps, pathsInSequence: ['/first', '/second'] }
  const step = steps[0]

  const req = {
    session: {
      ...buildSessionForJourney({ journeyName: 'apply', state: states.IN_PROGRESS, nextAllowedPath: '/first' })
    },
    path: '/first'
  }

  const res = {}
  const next = () => {}

  handlePost(journey, step)(req, res, next)

  t.equal(getNextAllowedPathForJourney('apply', req), '/second', 'it should add next allowed step to session')
  t.end()
})

test('handlePost() should invalidate review if required by step', (t) => {
  const dispatch = sinon.spy()
  const INVALIDATE_REVIEW = 'INVALIDATE_REVIEW'
  const { handlePost } = proxyquire('./handle-post', {
    ...defaultValidator,
    '../state-machine': {
      stateMachine: { dispatch },
      actions: { INVALIDATE_REVIEW }
    }
  })

  const steps = [{ path: '/first', next: () => '/second', shouldInvalidateReview: () => true }, { path: '/second' }]
  const journey = { steps }
  const step = steps[0]

  const req = {
    session: {},
    path: '/first'
  }

  const res = {}
  const next = () => {}

  handlePost(journey, step)(req, res, next)

  t.equal(dispatch.calledWith(INVALIDATE_REVIEW, req), true, 'it calls dispatch with the correct arguments')
  t.end()
})
