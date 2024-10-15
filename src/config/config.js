const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    REDIS_URL: Joi.string().required().description('Redis url'),
    REDIS_TTL: Joi.string().required().description('Redis TTL for expiry time'),
    TASK_SCHEDULER_SERVICE_URL: Joi.string().required().description('Task Scheduler Service url'),
    ADS_COST_PER_IMPRESSION: Joi.string().required().description('Ad cost per impression'),
    ADS_COST_PER_CLICK: Joi.string().required().description('Ad cost per click'),
    MESSAGING_SERVICE_URL: Joi.string().required().description('Task Scheduler Service url'),
    AUTH_SERVICE_URL: Joi.string().required().description('Auth Service url'),
    LINKEDIN_JOB_POSTING_URL: Joi.string().required().description('Linkedin Job Posting URL'),
    MEMBER_INVITATION_BASE_URL: Joi.string().required().description('Member Invitation Base URL'),
    RABBITMQ_SERVER_URL: Joi.string().required().description('RabbitMQ Server URL'),
    RABBITMQ_APP_PROG_UPD_EVT_QUEUE: Joi.string().required().description('Name for RabbitMQ Queue to update event in application progress'),
    RABBITMQ_APP_PROG_UPD_EVT_DLQ: Joi.string().required().description('Name for RabbitMQ Dead letter Queue to update event in application progress'),
    NOTIFICATION_QUEUE: Joi.string().required().description('Name for RabbitMQ Queue to create notifications'),
    MAXIMUM_RETRIES: Joi.string().required().description('RabbitMQ maximum number of retries'),
    RETRY_DELAY: Joi.string().required().description('RabbitMQ retry delay in seconds'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  redis: {
    url: envVars.REDIS_URL,
    ttl: envVars.REDIS_TTL,
  },
  services: {
    task_scheduler: envVars.TASK_SCHEDULER_SERVICE_URL,
    messaging: envVars.MESSAGING_SERVICE_URL,
    auth: envVars.AUTH_SERVICE_URL,
    member_invitation_url: envVars.MEMBER_INVITATION_BASE_URL,
  },
  ads: {
    cost_per_impression: envVars.ADS_COST_PER_IMPRESSION,
    cost_per_click: envVars.ADS_COST_PER_CLICK,
  },
  socialAccount: {
    linkedInJobPostingUrl: envVars.LINKEDIN_JOB_POSTING_URL,
  },
  rabbitmq: {
    url: envVars.RABBITMQ_SERVER_URL,
    queues: {
      applicationProgressUpdateEventQueue: envVars.RABBITMQ_APP_PROG_UPD_EVT_QUEUE,
      notificationQueue: envVars.NOTIFICATION_QUEUE,
    },
    dlq: {
      applicationProgressUpdateEventDLQ: envVars.RABBITMQ_APP_PROG_UPD_EVT_DLQ,
    },
    maxRetries: envVars.MAXIMUM_RETRIES,
    retryDelay: envVars.RETRY_DELAY,
  },
};
