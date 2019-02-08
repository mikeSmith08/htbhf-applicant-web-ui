const { check } = require('express-validator/check')
const { isNil } = require('ramda')
const { toDateString } = require('../common/formatters')
const { isValidDate, isDateMoreThanOneMonthAgo, isDateMoreThanEightMonthsInTheFuture } = require('../common/validators')
const { translateValidationMessage } = require('../common/translate-validation-message')
const { YES, NO } = require('../constants')

const isNilOrNo = value => isNil(value) || value === NO

const validateExpectedDeliveryDate = (res) => (_, { req }) => {
  if (isNilOrNo(req.body.areYouPregnant)) {
    return true
  }

  const expectedDeliveryDate = toDateString(
    req.body['expectedDeliveryDate-day'],
    req.body['expectedDeliveryDate-month'],
    req.body['expectedDeliveryDate-year']
  )

  if (!isValidDate(expectedDeliveryDate)) {
    throw new Error(req.t('validation:expectedDeliveryDateInvalid'))
  }

  if (isDateMoreThanOneMonthAgo(expectedDeliveryDate)) {
    res.locals.errorTitleText = req.t('validation:expectedDeliveryDateTooFarInPastTitle')
    throw new Error(req.t('validation:expectedDeliveryDateTooFarInPast'))
  }

  if (isDateMoreThanEightMonthsInTheFuture(expectedDeliveryDate)) {
    res.locals.errorTitleText = req.t('validation:expectedDeliveryDateTooFarInFutureTitle')
    throw new Error(req.t('validation:expectedDeliveryDateTooFarInFuture'))
  }

  return true
}

/**
 * Express validator does not give custom validations a reference to the express
 * response object. callValidateExpectedDeliveryDate() creates a closure enabling
 * validateExpectedDeliveryDate() to set properties on res.locals.
 */
const callValidateExpectedDeliveryDate = (req, res, next) =>
  check('expectedDeliveryDate').custom(validateExpectedDeliveryDate(res))(req, res, next)

const validate = [
  check('areYouPregnant').isIn([YES, NO]).withMessage(translateValidationMessage('validation:selectYesOrNo')),
  callValidateExpectedDeliveryDate
]

module.exports = {
  validate,
  validateExpectedDeliveryDate
}