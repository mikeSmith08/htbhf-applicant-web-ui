const { check } = require('express-validator')
const { translateValidationMessage } = require('../common/translate-validation-message')

const NINO_PATTERN = /^[a-zA-Z]{2}[\d]{6}[a-dA-D]$/

const validateNino = (_, { req }) => NINO_PATTERN.test(req.body.sanitizedNino)

const validate = () => [
  // calling custom validation method as the field in error is'nino', but the field being checked is 'sanitizedNino'.
  // the check method must take in the field name of the input box to correctly display validation errors.
  check('nino')
    .custom(validateNino)
    .withMessage(translateValidationMessage('validation:invalidNino'))
]

module.exports = {
  validate,
  NINO_PATTERN
}
