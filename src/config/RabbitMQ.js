const amqp = require('amqplib');
const config = require('./config');
const logger = require('./logger');

const RABBITMQ_SERVER = config.rabbitmq.url;

let connection;
let channel;

async function connect() {
    try {
        connection = await amqp.connect(RABBITMQ_SERVER);
        channel = await connection.createChannel();
        
        const queues = Object.values(config.rabbitmq.queues);
        for (const queue of queues) {
            await channel.assertQueue(queue, { durable: true });
        }
        const dlq = Object.values(config.rabbitmq.dlq);
        for (const queue of dlq) {
            await channel.assertQueue(queue, { durable: true,deadLetterExchange: '', });
        }
        logger.info('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

async function closeConnection() {
    if (connection) {
        await connection.close();
        logger.info('RabbitMQ connection closed');
    }
}

async function sendToQueue(queue, message) {
    try {
        if (channel) {
            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        } else {
            logger.error('Channel not initialized');
        }
    } catch (error) {
        logger.error(`Failed to send message ${JSON.stringify(message)} to ${queue}:`, error);
        throw error;
    }
}

module.exports = { connect, closeConnection, sendToQueue };