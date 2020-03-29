const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');

const SearchHistory = require('../models/searchhistory.model');
const {searchTitle} = require('../services/jobrequisition.service');
const {findSearchHistoryByKeyword, saveSearch} = require('../services/searchhistory.service');



module.exports = {
  getSuggestion
}



async function getSuggestion(currentUserId, keyword) {

  if(!keyword){
    return null;
  }

  let data;
  try {
    data = await findSearchHistoryByKeyword(keyword);

    if(!data.length){
      data = await searchTitle(keyword);
    }

    data = _.reduce(data, function(res, item){
      res.push(item.keyword);
      return res
    }, []);

  } catch (error) {
    console.log(error);
  }

  return data;
}
