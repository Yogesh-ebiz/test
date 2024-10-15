var _ = require('lodash');
var fs = require('fs');
const path = require('path');
import PDLJS from 'peopledatalabs';
const PeopleDataLabs = require('../../models/peopledatalabstransaction.model');
const PDLJSClient = new PDLJS({ apiKey: "715c6688a16f01e199e82d2a39500abee87d46cfcafbd486588ec666e17d14f6" });



/**
 * Search by query
 * @param {Object} esQuery
 * @param {String} size
 * @param {String} scroll_token
 */
const search = (esQuery, size, scroll_token) => {
  const params = {
    searchQuery: esQuery,
    size: size || 1,
    pretty: true
  };

  if(scroll_token){
    params.scroll_token = scroll_token;
  }

  return PDLJSClient.person.search.elastic(params).then(async (res) => {
    if(res){
      const peopleDataLabs = new PeopleDataLabs({
        success: true,
        scroll_token: res.scroll_token,
        rateLimit: res.rateLimit,
        noOfResults: res.data.length,
        creditUsed: res.rateLimit.callCreditsSpent
      });
      await peopleDataLabs.save();
    }

    return res;
  }).catch(async (error) => {
    console.log(error);
    const peopleDataLabs = new PeopleDataLabs({
      success: false,
      scroll_token: res.scroll_token,
      rateLimit: res.rateLimit,
      noOfResults: res.data.length,
      creditUsed: res.rateLimit.callCreditsSpent
    });
    await peopleDataLabs.save();
  });

  // return null;
};



module.exports = {
  search
};
