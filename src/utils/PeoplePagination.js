const _ = require('lodash');
const People = require('../models/people.model');

const defaultPagination = {
  content: [],
  scroll_token: null,
  totalElements: 0,
  empty: true
};




// function Pagination(pagination, locale) {
//
//   console.log('locale', locale)
//   if(pagination===null || typeof pagination==='undefined'){
//     return defaultPagination;
//   }
//
//   let page = --pagination.page;
//
//   this.content = pagination.docs ? normalizeJobFunction(pagination.docs) : [];
//   this.pageable = {
//     sort: {
//       unsorted: false,
//       sort: true,
//       empty: false
//     },
//     pageSize: pagination.limit,
//     pageNumber: --pagination.page,
//     offset: pagination.offset,
//     paged: pagination.docs.length?true:false,
//     unpaged: false
//   };
//
//
//
//   this.last  = pagination.hasNextPage  || false;
//   this.totalPages = pagination.totalPages;
//   this.totalElements = pagination.totalDocs;
//   this.first = (pagination.page-1 == 0) ? true:false;
//   this.numberOfElements = pagination.docs.length;
//   this.size = pagination.limit;
//   this.number = page;
//   this.empty = (pagination && pagination.totalDocs.lengh) ? false : true;
//
//
//   return this;
// }

class PeoplePagination {


  constructor(result, locale) {

    if(!result){
      return defaultPagination;
    }

    if(result?.data?.length){
      this.content = _.reduce(result.data, function(res, people){
        const p = new People(people);
        res.push(p.transform());
        return res;
      }, []);
    } else {
      this.content = [];
    }

    this.scroll_token = result?.scroll_token;
    this.total = result?.total;
    this.empty = this.content.length ? false : true;
  }

  get() {
    return this.pagination;
  }
}

module.exports = PeoplePagination;
