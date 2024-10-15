var _ = require('lodash');
var EventEmitter = require('eventemitter3');
const sovrenService = require('../services/api/sovren.service.api');
const fs = require('fs');
const { Base64Encode } = require('base64-stream');
const React = require('react');
const People = require('../models/people.model');
const People2 = require('../models/people2.model');
// const Berlin = require('../templates/Berlin');
const { generateResume, resumeToStream } = require('../templates/Resume');
const peopleService = require('../services/people.service');
const elasticsearch = require('../services/elasticsearch/elasticsearch');
const { generateUUID } = require('../utils/helper');
const rabbitMQ = require('./RabbitMQ');
const config = require('./config');
const myEmitter = new EventEmitter();
// const { getFunctions, httpsCallable } = require('firebase/functions');
// const functions = getFunctions();
// const getPeople = httpsCallable(functions, 'getPeople');
const taskAutomationService = require('../services/api/taskautomation.service.api');
const paymentService = require('../services/api/payment.service.api')


myEmitter.on('add-people', async (data) => {
  if (!data){
    return;
  }



  try {
    const createdDate = new Date();
    const uuid = generateUUID();

    console.log('add new people', data.id, data.first_name, data.last_name);
  // const a = await getPeople({index: 'people', id: 'D7m3oZmM8Py1vDsCCvDRRA_0000'});
  // const result = await updatePeople(data);
  // const a = await elasticsearch.getDocumentById('people', data._id);
  // console.log('result', result)

    await elasticsearch.upsertDocument('people', data.id, {...data, uuid}).then((res) => {

      // let people = new People(data);
      // people = people.transformWithContacts();
      // // await generateResume(people);
      // let stream = await resumeToStream(people);
      // if(stream){
      //   let parsedResume = null;
      //   let chunks = [];
      //   let modifiedDate = (new Date()).toISOString().substring(0, 10);
      //   let base64 = new Base64Encode();
      //   stream.on('data', function (chunk) {
      //     chunks.push(chunk);
      //   });
      //   stream.on('end', async () => {
      //     let combined = Buffer.concat(chunks);
      //     parsedResume = await sovrenService.uploadResumeBase64(combined.toString('base64'), modifiedDate, 'resume', data.id);
      //     console.log(`${people.firstName} Done.`)
      //
      //   });
      // }
    });


    let people = new People(data);
    people = people.transformWithContacts();
    // await generateResume(people);

    let stream = await resumeToStream(people);
    if(stream){
      let parsedResume = null;
      let chunks = [];
      let modifiedDate = (new Date()).toISOString().substring(0, 10);
      stream.on('data', function (chunk) {
        chunks.push(chunk);
      });
      stream.on('end', async () => {
        let combined = Buffer.concat(chunks);
        parsedResume = await sovrenService.uploadResumeBase64(combined.toString('base64'), modifiedDate, 'accessed', data.id);
        console.log(`${people.firstName} Done.`);
      });
    }


  } catch (err) {
      console.error(err)
  }
  // await new Promise(resolve => setTimeout(resolve, 5000));

  // people = people.transformWithContacts();

  // await generateResume(people);



  // await peopleService.bulkAdd(list)

});

myEmitter.on('log-parse-transaction', async (data) => {
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

myEmitter.on('create-task-for-automation', async (startDate, endDate, type, emailMeta) => {
  await taskAutomationService.addTask(startDate,endDate, type, emailMeta);
});

myEmitter.on('create-notification', async(user, company, notificationType, eventType, meta)=> {
  const message = {
    user,
    company,
    notificationType,
    eventType,
    meta
  };

  try {
    await rabbitMQ.sendToQueue(config.rabbitmq.queues.notificationQueue, message);
  } catch (error) {
    logger.error('Error sending notification message:', error);
  }
})

myEmitter.on('finalize-job-invoice', async (job, invoiceId) => {
  await paymentService.finalizeJobInvoice(job, invoiceId);
});

module.exports = { myEmitter };
