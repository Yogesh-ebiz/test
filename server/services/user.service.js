import { ApiClient } from '../client';

let client = new ApiClient();

export default {

  find(userId) {
    return client.get(`/users/${userId}`);
  },

  update(userId, data) {
    return client.put(`/users/${userId}`, data);
  }

}
