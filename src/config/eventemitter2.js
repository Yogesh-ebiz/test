var _ = require('lodash');
var EventEmitter = require('eventemitter3');
const sovrenService = require('../services/api/sovren.service.api');
const fs = require('fs')
const { Base64Encode } = require('base64-stream');
const React = require('react');
const People = require('../models/people.model');
const People2 = require('../models/people2.model');
const ParserTransaction = require('../models/sovrentransaction.model');
// const Berlin = require('../templates/Berlin');
const { generateResume, resumeToStream } = require('../templates/Resume');
const peopleService = require('../services/people.service');
// const myEmitter = new EventEmitter();


class EventEmitterInstance {
  static _instance = new EventEmitter();

  constructor() {
    return this.constructor._instance;
  }

  invoke() {};
}

EventEmitterInstance._instance.on('add-people', async (list) => {
  console.log('add new people', list.length);

  if (!list || (list && list.length < 1)){
    return;
  }

  try {
    list.forEach(async (item) => {
      // console.log(item)
      let people = new People(item);
      people = people.transformWithContacts();
      if(people.firstName==='katie') {
        console.log(`${people.firstName} starting.......`)
        // await generateResume(people);
        let stream = await resumeToStream(people);
        if(stream){
          let resume = null;
          let chunks = [];
          let modifiedDate = (new Date()).toISOString().substring(0, 10);
          let base64 = new Base64Encode();
          // stream.pipe(base64);
          stream.on('data', function (chunk) {
            chunks.push(chunk);
          });
          stream.on('end', async () => {

            let result = Buffer.concat(chunks);
            console.log('final result:', result.length);
            resume = await sovrenService.uploadResumeBase64(result.toString('base64'), modifiedDate, 'resume', people._id);
            // console.log(resume);
            console.log(`${people.firstName} Done.`)

          });
          // console.log(stream.read().toString('base64'))
          // const result = sovrenService.uploadResumeBase64(stream.read().toString('base64'), modifiedDate, 'resume', people._id);
          // fs.writeFileSync(`${__dirname}/${people.firstName.toLowerCase()}_${people.lastName.toLowerCase()}.json`, JSON.stringify(people))

        }
      }
    })
  } catch (err) {
    // console.error(err)
  }
  // await new Promise(resolve => setTimeout(resolve, 5000));

  let people = new People(list[0]);
  people = people.transformWithContacts();

  // await generateResume(people);



  console.log('finish after 5s');
  // await peopleService.bulkAdd(list)

});

EventEmitterInstance._instance.on('log-parse-transaction', async (data) => {
  console.log('Log Parser Transaction', data);

  try {
    if(data && data.Info){
      const { Info } = data;
      const parserTransaction = new ParserTransaction(Info);
      await parserTransaction.save();
    }
  } catch (err) {
    // console.error(err)
  }


});



module.exports = EventEmitterInstance;
