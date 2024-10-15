var _ = require('lodash');
var fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch')

const client = new Client({
  node: process.env.ELASTIC_CLOUD_ID,
  // cloud: { id: '2238215902' },
  auth: { apiKey: 'THVFRzBJZ0J6QmdOYnZQYmxmQW06M3dHUWNiVnJRMUdScUJpT1g4Vk5DZw==' },
  log: 'trace',
})

const createIndex = (indexName) => {

  client.indices.create({
    index: indexName
  }).then(function (resp) {
    return resp;
  }, function (err) {

  });
}

// 2. Check if index exists
const indexExists = (indexName) => {
  client.indices.exists({
    index: indexName
  }).then(function (resp) {
    return resp;
  }, function (err) {

  });
};

// 3.  Preparing index and its mapping
const initMapping = async (indexName, docType, payload) => {
  const data = {
    index: indexName,
    body: {
      properties: payload
    }
  };

  if(docType){
    data.type=docType;
  }
  return client.indices.putMapping(data).then(function (resp) {

    return resp;
  }, function (err) {
    console.log(err)
  });
};


/**
 * Search for Documents
 * @param {String} index - index
 * @param {Object} query - Query
 * @param {Boolean} source - return source
 * @param {Array} fields - return only fields
 * @returns {Promise<Document>}
 */
const searchDocuments = async (index, query, from=0, size=10, sorts, source=true, fields=[]) => {
  // console.log(query.query.bool.must)
  // for (const p in query.query.bool.must) {
  //   let obj = {};
  //   for (let p2 in query.query.bool.must[p]) {
  //     console.log(p2, query.query.bool.must[p][p2]);
  //     let value = query.query.bool.must[p][p2];
  //     let key =  p2 + '.keyword';
  //     delete query.query.bool.must[p][p2];
  //     query.query.bool.must[p].text = value;
  //     // console.log(key, query.query.bool.must[p][key]);
  //   }
  // }
  for (const p in query.query.bool.must) {
    for (let p2 in query.query.bool.must[p]) {
      console.log(p2, query.query.bool.must[p][p2]);
    }
  }

  for (const p in query.query.bool.must_not) {
    for (let p2 in query.query.bool.must_not[p]) {
      // console.log(p2, query.query.bool.must_not[p][p2]);
    }
  }

  const form = {
    from,
    size,
    index: index,
    body: query,
    _source: source,
    fields: fields || []
  };

  if(sorts && sorts.length){
    form.sort = sorts;
  }

  const res = await client.search(form);
  const data = _.reduce(res?.hits?.hits, function(res, item){

    if(fields && fields.length){
      const obj = _.reduce(item.fields, function(res2, v, k){
        res2[k] = v[0]
        return res2;
      }, {});
      obj.id = item._id;
      res.push(obj);
    } else {
      res.push({...item._source, id: item._id });
    }

    return res;
  }, []);
  return { data: data, total: res?.hits?.total.value, scroll_token: '' };
};


const scroll = async (scroll_id, scroll='10m') => {
  const res = await client.scroll({
    scroll,
    scroll_id
  });
  return res;
};

const getCount = async (index, query) => {
  const res = await client.count({
    index: index,
    body: query
  });
  return res?.count || 0;
};



/**
 * Get document by id
 * @param {String} index
 * @param {String} id
 * @returns {Promise<Document>}
 */
const getDocumentById = async (index, id) => {
  return client.get({ index, id}).then(function (resp) {
    return resp;
  }, function (err) {
    if(err){
      console.error(err?.body.error?.reason)
    }

    return null;

  });
};


/**
 * Get document by id
 * @param {String} index
 * @param {String} id
 * @param {String} docType
 * @param {Object} payload
 * @returns {Promise<Document>}
 */
const addDocument = (index, id, docType, payload) => {
  console.log('adding..........', payload.first_name)
  const doc = {index, body: payload};
  // if(docType){
  //   doc.type = docType;
  // }
  if(id){
    doc.id = id;
  }

  client.index(doc).then(function (res) {
    console.log('added', res)
    return res;
  }, function (err) {
    console.log(err)
  });
};



/**
 * Update document by id
 * @param {String} index
 * @param {String} id
 * @param {String} type
 * @param {Object} payload
 * @returns {Promise<Document>}
 */
// const updateDocument = (index, id, type, payload) => {
//   const doc = {index, id, body: { doc: payload } };
//   if(type){
//     doc.type = type;
//   }
//
//   client.update(doc, function (err, res) {
//     if(err){
//       console.log(err)
//     }
//
//     return res;
//   })
// };

const updateDocument = (index, id, payload, upsert) => {
  const doc = {index, id, body: { doc: payload } };
  if(upsert){
    doc.body.doc_as_upsert = true;
  }

  client.update(doc, function (err, res) {
    if(err){
      console.log(err)
    }

    return res;
  })
};

const upsertDocument = async (index, id, payload) => {
  const doc = {index, id, body: {} };
  const date = new Date();
  doc.body = {
    scripted_upsert: true,
    script: {
      lang: "painless",
      inline: `
      if ( ctx.op == 'index' ) {
        def created_date = ctx._source.created_date;
        def updated_date = new Date();
        def uuid = ctx._source.uuid;
        def obj = [:];
        obj.putAll(params);
        obj.created_date = created_date;
        obj.updated_date = updated_date;
        obj.uuid = uuid;
        ctx._source = obj;
      } else if ( ctx.op == 'create' ){
        def created_date = new Date();
        def obj = [:];
        obj.putAll(ctx._source);
        obj.created_date = created_date;
        obj.updated_date = null;
        ctx._source = obj;
      }
      `,
      params: payload
    },
    upsert: {...payload}
  }


  return client.update(doc).then(function (res) {
    return res;
  }, function (err) {
    console.log('error', err)
  })
};

/**
 * Update document by id
 * @param {String} index
 * @param {String} id
 * @param {String} type
 * @param {Boolean} refresh
 * @param {Object} query
 * @param {Object} script
 * @param {Object} upsert
 * @returns {Promise<Document>}
 */
const updateDocumentByQuery = (index, id, type, refresh, query, script, upsert) => {
  const doc = {index,  body: { query, script } };
  doc.refresh = refresh || false;

  if(upsert){
    doc.upsert = upsert;
    doc.scripted_upsert = true;
  }

  if(type){
    doc.type = type;
  }

  client.updateByQuery(doc, function (err, res) {
    if(err){

    }

    return res;
  })
};

/**
 * Get delete by id
 * @param {String} index
 * @param {String} id
 */
const deleteDocumentById = (index, id) => {
  client.delete({ index, id }, function (err, res) {
    if(err){

    }

    return res;
  })
};

/**
 * Get delete by query
 * @param {String} index
 * @param {Object} Match Query
 */
const deleteByQuery = (index, type, query) => {
  const doc = {index, body: { query } };
  if(type){
    doc.type = type;
  }
  client.deleteByQuery(doc, function (err, res) {
    if(err){

    }

    return res;
  })
};



module.exports = {
  createIndex,
  indexExists,
  initMapping,
  searchDocuments,
  scroll,
  getCount,
  getDocumentById,
  addDocument,
  updateDocument,
  upsertDocument,
  updateDocumentByQuery,
  deleteDocumentById,
  deleteByQuery
};
