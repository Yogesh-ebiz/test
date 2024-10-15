// const { functions } = require('./firebaseApp');
require('./firebaseUtil');
import { getFunctions, httpsCallable } from "@firebase/functions";
const functions = getFunctions;

const getPeopleFn = httpsCallable(functions, 'getPeople');
const updatePeopleFn = httpsCallable(functions, 'updatePeople');

const getPeople = async (data) => {
  return getPeopleFn(data).then(result => {
    return result;
  }).catch((err) => {
    console.error('Error: ', err);
  });
};

const updatePeople = async (data) => {
  console.log('start', data.id, new Date())
  return updatePeopleFn(data).then(result => {
    console.log('end', result.data._id, new Date())
    return result?.data;
  }).catch((err) => {
    console.log('Error: ', err);
  });
};

module.exports = {
  getPeople,
  updatePeople
}
