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


class Pagination {


  constructor(data, filter, locale) {
    // console.log(data)

    if(data===null || typeof data==='undefined'){
      return defaultPagination;
    }

    let totalPages = data.count? Math.ceil(data.count / filter.size) : 0;
    let numberOfElements = (data && data.result.length) ? data.result.length : 0;
    this.content = data.result;// ? normalizeJobFunction(data.docs) : [];
    this.pageable = {
      sort: {
        unsorted: false,
        sort: true,
        empty: false
      },
      pageSize: filter.size,
      pageNumber: filter.page,
      paged: (filter.page>0)?true:false,
      unpaged: (filter.page==0)?true:false
    };



    this.last  = ((totalPages-1)==filter.page)?true : false;
    this.totalPages = totalPages;
    this.totalElements = data.count;
    this.first = (filter.page==0) ? true:false;
    this.numberOfElements = numberOfElements;
    this.size = filter.size;
    this.number = filter.page;
    this.empty = numberOfElements ? false : true;
  }

  get() {
    return this.pagination;
  }
}

module.exports = Pagination;
