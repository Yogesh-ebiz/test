const ApiClient = require('../apiManager');
const _ = require('lodash');
const config = require('../../config/config')

const options = { headers: {'userId': null } };
//let client = new ApiClient('http://accessed-task-scheduler-service.us-west-2.elasticbeanstalk.com/api');
let client = new ApiClient(config.services.task_scheduler);

async function addTask(startDate, endDate, type, meta) {
    let newTask = {};
    newTask.required = true;
    newTask.type = type;
    newTask.startDate = startDate.getTime();
    newTask.endDate = endDate.getTime();
    newTask.reminders = ['D1'];
    newTask.meta = meta;
    switch (type) {
        case 'EMAIL':
          newTask.name = 'Send Email';
          break;
        case 'EVENT':
          newTask.name = 'Set-up Event';
          break;
    }
    try {
      let response = await client.post('/task', newTask, options);
      return response.data;
    } catch (error) {
      console.error(`Failed to create task: ${JSON.stringify(newTask)}. Error: ${error}`);
      return null;
    }
}

module.exports = {addTask};