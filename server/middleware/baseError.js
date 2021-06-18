class BaseError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return 400;
    } if (this instanceof NotFound) {
      return 404;
    } if (this instanceof PaymentError) {
      console.log(this.status)
      return this.status;
    }
    return 500;
  }
}

class BadRequest extends BaseError { }
class NotFound extends BaseError { }

class PaymentError extends BaseError { }

module.exports = {
  BaseError: BaseError,
  BadRequest,
  NotFound,
  PaymentError
};
