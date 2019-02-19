const { isNil } = require('ramda')
const validator = require('validator')
const { dateAsString } = require('./formatters')

const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

const isValidDate = (dateString) =>
  !isNil(dateString) && validator.matches(dateString, DATE_PATTERN) && validator.isISO8601(dateString, { strict: true })

const isDateInPast = (dateString) => {
  if (isValidDate(dateString)) {
    return validator.isBefore(dateString, dateAsString())
  }
  return true
}

const isDateMoreThanOneMonthAgo = (dateString) => {
  if (isValidDate(dateString)) {
    return validator.isBefore(dateString, dateAsString({ monthAdjustment: -1 }))
  }
  return true
}

const isDateMoreThanEightMonthsInTheFuture = (dateString) => {
  if (isValidDate(dateString)) {
    return validator.isAfter(dateString, dateAsString({ monthAdjustment: 8 }))
  }
  return true
}

module.exports = {
  isValidDate,
  isDateInPast,
  isDateMoreThanOneMonthAgo,
  isDateMoreThanEightMonthsInTheFuture
}