const { check } = require('express-validator/check')
const { toDateString } = require('../common/formatters')
const { isValidDate, isDateMoreThanOneMonthAgo, isDateMoreThanEightMonthsInTheFuture } = require('../common/validators')
const { YES, NO } = require('./constants')

const addDateToBody = (req, res, next) => {
  if (req.body.areYouPregnant === NO) {
    return next()
  }

  req.body.expectedDeliveryDate = toDateString(
    req.body['expectedDeliveryDate-day'],
    req.body['expectedDeliveryDate-month'],
    req.body['expectedDeliveryDate-year']
  )

  return next()
}

const validateExpectedDeliveryDate = (expectedDeliveryDate, { req }) => {
  if (req.body.areYouPregnant === NO) {
    return true
  }

  if (!isValidDate(expectedDeliveryDate)) {
    throw new Error(req.t('validation:expectedDeliveryDateInvalid'))
  }

  if (isDateMoreThanOneMonthAgo(expectedDeliveryDate)) {
    throw new Error(req.t('validation:expectedDeliveryDateInvalidTooFarInPast'))
  }

  if (isDateMoreThanEightMonthsInTheFuture(expectedDeliveryDate)) {
    throw new Error(req.t('validation:expectedDeliveryDateInvalidTooFarInFuture'))
  }

  return true
}

const validate = [
  check('areYouPregnant').isIn([YES, NO]).withMessage((value, { req }) => req.t('validation:selectYesOrNo', { value })),
  addDateToBody,
  check('expectedDeliveryDate').custom(validateExpectedDeliveryDate)
]

module.exports = {
  validate,
  validateExpectedDeliveryDate
}
