const Joi = require('joi');

const nameRegex = /[\w_]+/;

const AMQP_SCHEMA = 'amqpSchema';

const schemas = {
  amqpSchema: Joi.object({
    logger: Joi.object({
      name: Joi.string(),
      filepath: Joi.string(),
    }),
    connection: Joi.object({
      host: Joi.string().required(),
      user: Joi.string().required(),
      pass: Joi.string().required(),
      vhost: Joi.string().required(),
    }).required(),
    loggers: Joi.object().pattern(nameRegex, Joi.object({
      name: Joi.string().required(),
      levels: Joi.array().items(Joi.string().required()),
    })),
    queues: Joi.object().pattern(nameRegex, Joi.object({
      queueName: Joi.string().required(),
      bindings: Joi.array().items(Joi.object().pattern(nameRegex, Joi.string().required())),
      options: Joi.object({
        durable: Joi.bool().required()
      })
    })),
    processors: Joi.object().pattern(nameRegex, Joi.object({
      listeners: Joi.array().items(Joi.object().pattern(nameRegex, Joi.string().required()))
    }))
  }).pattern(nameRegex, Joi.object())
}

/**
 * Validate schema
 *
 * @param {Object} schema JSON schema
 * @param {string} key Valid schema key
 */
const validate = async (schema, key) => {
  return await Joi.validate(schema, schemas[key]);
}

module.exports =
{
  validate,
  AMQP_SCHEMA
}