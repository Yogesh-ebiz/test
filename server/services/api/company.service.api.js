const ApiClient = require('../apiManager');


let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');

module.exports = {

  find(id) {
    return client.get(`/company/${id}`);
  },

  followCompany(id, userId){

    const options = {
      headers: {'userId': userId}
    };
    return client.post(`/company/${id}/follow`, {}, options);
  },


  createJobPost(id, jobId, userId){

    const options = {
      headers: {'userId': userId}
    };
    return client.post(`/feeds`, data, options);
  },

  update(userId, data) {
    return client.put(`/users/${userId}`, data);
  }

}
