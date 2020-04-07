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


    if(data===null || typeof data==='undefined'){
      return defaultPagination;
    }

    let totalPages = data.length? Math.ceil(data.length / filter.size) : 0;

    this.content = data;// ? normalizeJobFunction(data.docs) : [];
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
    this.totalElements = data.length;
    this.first = (filter.page==0) ? true:false;
    this.numberOfElements = data.length;
    this.size = filter.size;
    this.number = filter.page;
    this.empty = (data && data.lengh) ? false : true;
  }

  get() {
    return this.pagination;
  }
}

module.exports = Pagination;
