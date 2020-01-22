// const pagination =  {
//   totalDocs: 'totalElements',
//   docs: 'content',
//   limit: 'size',
//   page: 'currentPage',
//   nextPage: 'last',
//   prevPage: 'first',
//   totalPages: 'totalPages',
//   pagingCounter: 'slNo',
//   meta: 'paginator'
// };


// result.docs
// result.totalDocs = 100
// result.limit = 10
// result.page = 1;
// result.totalPages = 10
// result.hasNextPage = true
// result.nextPage = 2
// result.hasPrevPage = false
// result.prevPage = null
// result.pagingCounter = 1


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

function Pagination(pagination) {

  let page = --pagination.page;
  if(pagination===null){
    return defaultPagination;
  }

  console.log(pagination.docs);
  this.content = pagination.docs ? pagination.docs : [];
  this.pageable = {
    sort: {
      unsorted: false,
      sort: true,
      empty: false
    },
    pageSize: pagination.limit,
    pageNumber: page,
    offset: pagination.offset,
    paged: pagination.docs.length?true:false,
    unpaged: false
  };



  this.last  = pagination.hasNextPage  || false;
  this.totalPages = pagination.totalPages;
  this.totalElements = pagination.totalDocs;
  this.first = (pagination.page-1 == 0) ? true:false;
  this.numberOfElements = pagination.docs.length;
  this.size = pagination.limit;
  this.number = page;
  this.empty = (pagination && pagination.totalDocs.lengh) ? false : true;


  return this;
}

module.exports = Pagination;
