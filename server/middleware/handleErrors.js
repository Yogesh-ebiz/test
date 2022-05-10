const { BaseError } = require('./baseError');

const handleErrors = function(err, req, res, next) {
  if (err instanceof BaseError) {
    console.log('instance of BaseError')
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
