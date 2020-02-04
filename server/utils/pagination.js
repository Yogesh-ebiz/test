const _ = require('lodash');

const defaultPagination = {
  content: [],
  pageable: {
    sort: {
      unsorted: false,
      sort: true,
      empty: false
    },
    pageSize: 1,
    pageNumber: 0,
    offset: 0,
    paged: false,
    unpaged: false
  },
  last: true,
  totalPages: 0,
  totalElements: 0,
  first: false,
  numberOfElements: 0,
  size: 0,
  number: 0,
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

class Pagination {


  constructor(data, locale) {


    if(data===null || typeof data==='undefined'){
      return defaultPagination;
    }

    let page = --data.page;

    this.content = data.docs;// ? normalizeJobFunction(data.docs) : [];
    this.pageable = {
      sort: {
        unsorted: false,
        sort: true,
        empty: false
      },
      pageSize: data.limit,
      pageNumber: --data.page,
      offset: data.offset,
      paged: data.docs.length?true:false,
      unpaged: false
    };



    this.last  = data.hasNextPage  || false;
    this.totalPages = data.totalPages;
    this.totalElements = data.totalDocs;
    this.first = (data.page-1 == 0) ? true:false;
    this.numberOfElements = data.docs.length;
    this.size = data.limit;
    this.number = page;
    this.empty = (data && data.totalDocs.lengh) ? false : true;
  }

  get() {
    return this.pagination;
  }
}

module.exports = Pagination;
