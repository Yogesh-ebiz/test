const _ = require('lodash');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const httpStatus = require('http-status');
const geoip = require('geoip-lite');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { Member } = require("../models");
const { memberService } = require("../services");
const statusEnum = require("../const/statusEnum");

const verify = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // console.log('verify......................', info)
  // console.log('user', user)

  const userId = req.header('userId');
  const {companyId} = req.params;
  const foundUser = await User.findById(ObjectID(userId));

  // console.log(userId, companyId)
  const member = await memberService.findMember(userId, companyId);

  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  // console.log('requiredRights', requiredRights)
  return new Promise((resolve, reject) => {
    verify(req, resolve, reject, requiredRights);
  })
    .then(() => next())
    .catch((err) => next(err));
};


const authorize = (...requiredRights) => async (req, res, next) => {
  // console.log('requiredRights', requiredRights)
  //const { companyId } = req.params;
  const userId = req.header('userId');
  const memberId = req.header('memberId');
  const companyId = req.header('companyId');

  // console.log('memberId', memberId);
  if (!memberId || !companyId) {
    return res.status(403).json({
      status: 403,
      message: 'FORBIDDEN'
    })
  } else {
    let member = await memberService.findById(memberId).populate('role').populate('company');
    // console.log('member', member)

    if (!member) {
      // console.log('no memberId')
      return res.status(403).json({
        status: 403,
        message: 'FORBIDDEN'
      })
    }

    if(!member?.timezone){
      let ip = req.header('X-Forwarded-For') || req.connection.remoteAddress || req.ip;
      const geo = geoip.lookup(ip); // Lookup geolocation info
      if(geo && geo.timezone){
        member.timezone = geo.timezone;
      }else{
        member.timezone = 'America/Chicago'
      }
    }
    req.user = member;

    if (!requiredRights.length){
      next();
    } else {

      // console.log('member', member);
      if (member && member.status == statusEnum.ACTIVE && member.role && member.company?.companyId === Number(companyId)) {
        // console.log(member.role.privileges);
        if ( _.difference(requiredRights, member.role.privileges).length > 0){
          return res.status(403).json({
            status: 403,
            message: 'FORBIDDEN'
          })
        }

        next();

      } else {
        return res.status(403).json({
          status: 403,
          message: 'FORBIDDEN'
        })
      }
    }
  }
}


const isUserAuthenticated = (...requiredRights) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // const { companyId } = req.params;
  const userId = req.header('userId');
  // console.log('isUserAuthenticated', requiredRights, req.params)

  if (!userId) {
    return res.status(403).json({
      status: 403,
      message: 'FORBIDDEN'
    })
  } else {
    const foundUser = await memberService.findByUserIdAndCompany();

    if (foundUser) {
      res.user = foundUser;
      next()
    } else {
      return res.status(403).json({
        status: 403,
        message: 'FORBIDDEN'
      })
    }
  }
}


module.exports = {
  auth,
  authorize,
  isUserAuthenticated
};
