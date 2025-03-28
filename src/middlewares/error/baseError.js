class BaseError extends Error {
  constructor(status, message)  {
    super();

    console.log('BaseError', this)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError)
    }

    this.status = status;
    this.message = message;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return 400;
    } if (this instanceof NotFound) {
      return 404;
    } if (this instanceof PaymentError) {
      return this.status;
    } if (this instanceof SubscriptionExist) {
      console.log('instance of Subscription')
      return this.status;
    }
    if (this instanceof ApplicationExist) {
      console.log('ApplicationExist....')
      return 400;
    }

    return 500;
  }
}

class BadRequest extends BaseError { }
class NotFound extends BaseError { }
class SubscriptionExist extends BaseError { }
class PaymentError extends BaseError { }
class ApplicationExist extends BaseError { }

module.exports = {
  BaseError: BaseError,
  BadRequest,
  NotFound,
  PaymentError,
  SubscriptionExist,
  ApplicationExist
};
