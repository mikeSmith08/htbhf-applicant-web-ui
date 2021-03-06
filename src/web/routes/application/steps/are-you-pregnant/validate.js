const { check } = require('express-validator')
const { isNil } = require('ramda')

const { toDateString } = require('../common/formatters')
const { NO } = require('../common/constants')

const {
  isValidDate,
  isDateOneOrMoreMonthsInThePast,
  isDateMoreThanEightMonthsInTheFuture,
  validateIsYesOrNo
} = require('../common/validators')

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

  if (isDateOneOrMoreMonthsInThePast(expectedDeliveryDate)) {
    throw new Error(req.t('validation:expectedDeliveryDateTooFarInPast'))
  }

  if (isDateMoreThanEightMonthsInTheFuture(expectedDeliveryDate)) {
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

const validate = () => [
  validateIsYesOrNo('areYouPregnant', 'validation:selectYesOrNoAreYouPregnant'),
  callValidateExpectedDeliveryDate
]

module.exports = {
  validate,
  validateExpectedDeliveryDate
}
