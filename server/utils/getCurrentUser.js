var jwt = require('jsonwebtoken');
var config = require('./../config/config.constants');

module.exports = function (req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  // decode token
  if (token) {

    var hash = config.secret.replace(/^\$2y(.+)$/i, '\$2a$1');
    // verifies secret
    jwt.verify(token, hash, function (err, decoded) {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        wpUserModel.getUserInformationById(req.decoded.id, function (err, user) {
          req.currentUser = user;
          next();
        });
      }
    });
  } else {
    // if there is no token

    return res.status(403).json({
      message: 'Invalid token'
    });
  }
};
