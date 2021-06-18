const { BaseError } = require('./baseError');

const handleErrors = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res.status(err.getCode()).json({
      status: 'error',
      message: err.message
    });
  }

  return res.status(500).json({
    status: 'error',
    message: err.message
  });
}


module.exports = handleErrors;
