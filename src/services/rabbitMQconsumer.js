const rabbitMQ = require('../config/RabbitMQ');
const logger = require('../config/logger');
const config = require('../config/config');
const { ObjectId } = require('mongodb');
const applicationProgressService = require('./applicationprogress.service');

let channel; 

async function startConsumer() {
    try {
        channel = await rabbitMQ.connect();
        
        const queues = config.rabbitmq.queues;
        
        for (const queue of Object.values(queues)) {
            if (queue !== config.rabbitmq.queues.notificationQueue) {
                channel.assertQueue(queue, { durable: true });
                channel.consume(queue, async (message) => {
                    if (message !== null) {
                        try {
                            const content = JSON.parse(message.content.toString());;
                            logger.info(`Received message from ${queue}: ${JSON.stringify(content)}`);
                            await processMessage(queue, content);
                            channel.ack(message);
                        } catch (error) {
                            logger.error(`Error processing message from ${queue}:`, error);
                            channel.nack(message);
                        }
                    }
                });
            }
        }
    } catch (error) {
        logger.error('Error starting consumer:', error);
        throw error;
    }
}

async function processMessage(queue, content, retries = 0) {
    try{
        switch (queue) {
            case config.rabbitmq.queues.applicationProgressUpdateEventQueue:
                await applicationProgressService.updateApplicationProgressEvent(new ObjectId(content.applicationProgressId), {eventId:new ObjectId(content.eventId)});
                logger.info(`Message from ${queue} processed.`)
                break;
            default:
                logger.warn(`No processing defined for queue: ${queue}`);
        }
    }catch(error){
        logger.error(`Error processing message from ${queue}:`, error);
        
        if (retries < config.rabbitmq.maxRetries) {
            const retryDelay = config.rabbitmq.retryDelay || 5000;
            setTimeout(() => {
                processMessage(queue, content, retries + 1);
            }, retryDelay);
        } else {
            await channel.sendToQueue(config.rabbitmq.dlq.applicationProgressUpdateEventDLQ, Buffer.from(JSON.stringify(content)));
            logger.warn(`Message moved to DLQ after ${retries} retries:`, content);
        }
    }
    
}

module.exports = { startConsumer };
