const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class Error500 extends BaseError {
  constructor (
    name,
    statusCode = httpStatusCodes.NOT_FOUND,
    description = 'Unauthorized.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}

module.exports = Error401
