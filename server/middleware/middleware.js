module.exports = function (options) {
  return function (req, res, next) {
    // Implement the middleware function based on the options object
    next()
  }
}


module.exports = function isLoggedIn(req, res, next) {
  if (req.user) {
    // user is authenticated
    next();
  } else {
    // return unauthorized
    res.send(401, "Unauthorized");
  }
};
