/**
 * @desc    This file contain Success and Error response for sending to client / user
 * @author  Huda Prasetyo
 * @since   2020
 */

/**
 * @desc    Send any success response
 *
 * @param   {string} message
 * @param   {object | array} results
 * @param   {number} statusCode
 */
exports.success = (message, data, statusCode) => {
  return {
    message,
    error: false,
    status: statusCode,
    data
  };
};

/**
 * @desc    Send any error response
 *
 * @param   {string} message
 * @param   {number} statusCode
 */
exports.error = (message, statusCode) => {
  // List of common HTTP request code
  const codes = [200, 201, 400, 401, 404, 403, 422, 500];

  // Get matched code
  const findCode = codes.find((code) => code == statusCode);

  if (!findCode) statusCode = 500;
  else statusCode = findCode;

  return {
    message,
    status: statusCode,
    error: true
  };
};

/**
 * @desc    Send any validation response
 *
 * @param   {object | array} errors
 */
exports.validation = (errors) => {
  return {
    message: "Validation errors",
    error: true,
    status: 422,
    errors
  };
};
