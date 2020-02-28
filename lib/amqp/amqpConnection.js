const { connect } = require('amqplib');
const ProcessorsHandler = require('./amqpProcessors');
const consumeMessage = require('./amqpMessage');
const Publisher = require('./models/publisher');

class AmqpConnection {
  /**
   * Instantiate a amqp connection
   * @constructor
   * @param {Object} amqpSchema AMQP schema
   * @param {any} dependencyInjector DI Instance
   */
  constructor(amqpSchema, dependencyInjector) {
    this.container = dependencyInjector.container;
    this.amqpLogger = this.container['amqp_logger'];
    this.processors = {};
    this.amqpSchema = amqpSchema;

    const { host, user, pass, vhost } = amqpSchema['connection'];
    return connect(`amqp://${user}:${pass}@${host + vhost}`)
      .then((connection) => {
        this.connection = connection;
        return this.connection.createChannel();
      })
      .then(async(ch) => {
        this.initialiePublisher(ch, dependencyInjector);
        await this.initializeProcessors(amqpSchema);
        await this.initializeQueues(ch, amqpSchema['queues'] || {});
      })
      .catch((err) => {
        this.amqpLogger.error(err);
        if (this.connection) {
          this.connection.close();
        }
      })
  }

  /**
   * Initialize AMQP publisher
   * @param {Object} ch AMQP channel instance
   * @param {any} dependencyInjector DI Instance
   */
  initialiePublisher(ch, dependencyInjector) {
    const publisher = new Publisher(ch, 'global');
    publisher.setLogger(this.amqpLogger);
    dependencyInjector.factory('publisher', () => publisher);
  }

  /**
   * Initialize amqp queues
   * @param {Object} ch AMQP channel instance
   * @param {Object} queues AMQP queues schema
   */
  async initializeQueues(ch, queues) {
    Object.keys(queues).forEach(queueAlias => {
      const { queueName, options, bindings } = queues[queueAlias];
      ch.assertQueue(queueName, options ? options : {});

      this.amqpLogger.debug(`[x] amqp_started_queue: ${queueName}`);

      for(let binding of bindings) {
        Object.keys(binding).forEach(exchange => {
          ch.assertExchange(exchange, 'topic', { durable: true });
          ch.bindQueue(queueName, exchange, binding[exchange]);

          ch.consume(queueName, (msg) => {
            try {
              // this.amqpLogger.debug(`[x] amqp_before_consume_message: ${msg.content.toString()}`);
              consumeMessage(msg, this.processors);
              this.logConsumerResult(msg, 'success');
            } catch (err) {
              this.logConsumerResult(msg, 'error', err);
            } finally {
              ch.ack(msg);
            }
          }, {
            noAck: false
          });
        })
      }
    });
  }

  /**
   * Initialize queue processors
   *
   * @param {Object} amqpSchema AMQP schema
   */
  async initializeProcessors(amqpSchema) {
    const processorsHandler = new ProcessorsHandler(amqpSchema, this.container);
    this.processors = processorsHandler.getProcessors();
    return;
  }

  /**
   * log consumer results (error and sucess)
   *
   * @param {any} msg AMQP message buffer
   * @param {String} status status of the consumed message
   * @param {Error} err error when exists
   */
  logConsumerResult(msg, status, err = null) {
    let logResult = {
      status,
      msg: {
        content: msg.content.toString(),
        properties: msg.properties,
        fields: msg.fields
      },
      created_at: new Date().toISOString(),
    };

    const logMessage = `[x] amqp_consumer_result: ${JSON.stringify(logResult)}`;
    if (err) {
      this.amqpLogger.error({ err }, logMessage);
    } else {
      this.amqpLogger.debug(logMessage);
    }
  }
}

module.exports = AmqpConnection;