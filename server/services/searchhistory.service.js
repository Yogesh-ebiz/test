const _ = require('lodash');
const SearchHistory = require('../models/searchhistory.model');


function findSearchHistoryByKeyword(keyword) {
  let data = null;

  if(keyword==null){
    return;
  }
  var regex = new RegExp(keyword, 'i');
  return SearchHistory.find({keyword: regex}).sort({"count":-1}).limit(10);
}



async function saveSearch(userId, keyword) {
  let data = null;

  if(keyword==null){
    return;
  }

  let match = {keyword: keyword, partyId: userId}

  console.log('match', match)
  data =  SearchHistory.aggregate( [
    { $match: {keyword: "ios"} },
    { $merge: { into: "searchhistory", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } }
  ] )

  return data;

}


module.exports = {
  findSearchHistoryByKeyword,
  saveSearch
}
