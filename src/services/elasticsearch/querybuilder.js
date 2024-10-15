const _ = require('lodash');
const esb = require('elastic-builder');
const mapping = require('../../../migrations/elasticsearch/people.mapping.json');
const requestBody = new esb.RequestBodySearch();

// Helper method for getting path from dot notation string
const ref = (obj, str) => {
  return str.split('.').reduce(function(o, x) { return o[x] }, obj);
}
const getField = (field, isExternal) => {
  return isExternal? field: field.concat('.keyword');
}
class QueryBuilder {
  constructor(filter) {
    this.filter = filter || {}
  }

  build(filter, isExternal) {
    const {must, must_not} = filter
    if (!_.isEmpty(must)){
      let booleanQuery = esb.boolQuery();

      for (const key in must) {
        if(must[key]){
          if (typeof must[key]==='string') {
            booleanQuery.must(
              new esb.MatchQuery(getField(key, isExternal), must[key])
            );
          } else if (typeof must[key] === 'boolean') {
            booleanQuery.must(
              new esb.MatchQuery(getField(key, isExternal), must[key])
            );
          } else if (Array.isArray(must[key]) && must[key].length>0) {
            booleanQuery.must(
              new esb.TermsQuery(getField(key, isExternal), must[key])
            );
          }


        }

      }

      for (const key in must_not) {
        if(must_not[key]){
          if (typeof must_not[key]==='string') {
            booleanQuery.mustNot(
              new esb.MatchQuery(getField(key, isExternal), must_not[key])
            );
          } else if (typeof must_not[key] === 'boolean') {
            booleanQuery.mustNot(
              new esb.MatchQuery(getField(key, isExternal), must_not[key])
            );
          } else if (Array.isArray(must_not[key]) && must_not[key].length>0) {
            booleanQuery.mustNot(
              new esb.TermsQuery(getField(key, isExternal), must_not[key])
            );
          }


        }

      }

      requestBody.query(booleanQuery);

    }

    return requestBody;
  }


}
module.exports = new QueryBuilder();
