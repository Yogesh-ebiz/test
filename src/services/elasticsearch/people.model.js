const {addDocument, deleteDocumentById, getDocumentById, updateDocument, upsertDocument, searchDocuments} = require('./elasticsearch');

// ToDo

class PeopleModel {
  constructor() {
    if (this.instance) return this.instance;
    PeopleModel.instance = this;
  }

  // get() {
  //   return database.getList('chats');
  // }

  getById(id) {
    return getDocumentById('people', id);
  }

  create(people) {
    return addDocument('people', people);
  }

  delete(id) {
    return deleteDocumentById('people', id);
  }

  update(id, people) {
    return updateDocument('people', id, people);
  }

  search(filter, options) {
    return searchDocuments('people', filter, options);
  }

}

module.exports = new PeopleModel();
