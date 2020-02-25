const Bottle = require('bottlejs');
const yaml = require('js-yaml');
const fs = require('fs');
const { validate, AMQP_SCHEMA } = require('./validators');
const AmqpConnection = require('./lib/amqp/amqpConnection');
const createLogger = require('./logger');

class ContainerApp {
  /**
   * @constructor
   * @param {String} filename rabbitmq yaml file definition
   */
  constructor(filename) {
    this.filename = filename;
    this.dependencyInjector = new Bottle();
  }

  async bootstrapAmqpApp() {
    const amqpYamlSchema = yaml.safeLoad(fs.readFileSync(this.filename, 'utf8'));
    const amqpJsonSchema = await validate(amqpYamlSchema, AMQP_SCHEMA);

    const {
      loggerName = 'amqp_logger',
      filepath = '/etc/logs'
    } = amqpJsonSchema['logger'] ? amqpJsonSchema['logger'] : {};

    const amqpLogger = new createLogger(loggerName, {
      path: filepath,
      levels: ['debug', 'error'],
    });

    this.dependencyInjector.factory('amqp_logger', () => amqpLogger);

    try {
      await new AmqpConnection(amqpJsonSchema, this.dependencyInjector.container);
    } catch(err) {
      amqpLogger.error(err);
    }
  }
}

module.exports = (yamlFile) => {
  const containerApp = new ContainerApp(yamlFile);
  return containerApp;
};