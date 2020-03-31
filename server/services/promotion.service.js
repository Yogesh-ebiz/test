const _ = require('lodash');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Promotion = require('../models/promotion.model');


function findPromotionById(promotionId, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(promotionId==null){
    return;
  }

  let propLocale = '$name.'+localeStr;

  let match = { promotionId: promotionId };

  data = Promotion.aggregate([
    { $match: match },
    { $project: {promotionId: 1, type: 1, name: propLocale, status: 1, hasExpired: 1, createdDate: 1, startDate: 1, endDate: 1, status: 1 } }
  ]);

  return data

  // return Promotion.findOne({promotionId: promotionId});
}

function findPromotionByObjectId(id, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(id==null){
    return;
  }

  let propLocale = '$name.'+localeStr;

  let match = { _id: id };

  data = Promotion.aggregate([
    { $match: match },
    { $project: {promotionId: 1, type: 1, name: propLocale, status: 1, hasExpired: 1, createdDate: 1, startDate: 1, endDate: 1, status: 1 } }
  ]);

  // return Promotion.find({id: promotionId});
  return data;
}


function getPromotions(list, locale) {
  let localeStr = locale? locale.toLowerCase() : 'en';
  let data = null;

  if(!list){
    return [];
  }

  let propLocale = '$name.'+localeStr;

  let match = { promotionId: {$in: list} };

  data = Promotion.aggregate([
    { $match: match },
    { $project: {promotionId: 1, type: 1, name: propLocale, status: 1, hasExpired: 1, createdDate: 1, startDate: 1, endDate: 1, status: 1 } }
  ]);

  return data;
}



module.exports = {
  findPromotionByObjectId: findPromotionByObjectId,
  findPromotionById: findPromotionById,
  getPromotions:getPromotions
}
