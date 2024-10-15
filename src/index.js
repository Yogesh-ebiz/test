const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const redisClient = require('./config/redisClient');
const rabbitMQ = require('./config/RabbitMQ');
const rmqConsumer = require('./services/rabbitMQconsumer');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    rmqConsumer.startConsumer().catch((err) => {
      logger.error('Failed to start consumer:', err);
  });
  });
}).catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

const exitHandler = () => {
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      if (redisClient) {
        redisClient.quit();
      }
      await rabbitMQ.closeConnection();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = async (error) => {
  logger.error(error);
  await exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(async () => {
      if (redisClient) {
        redisClient.quit();
      }
      await rabbitMQ.closeConnection();
    });
  }
});
