const { connect } = require('amqplib');
const ProcessorsHandler = require('./amqpProcessors');
const consumeMessage = require('./amqpMessage');

class AmqpConnection {
  /**
   * Instantiate a amqp connection
   * @constructor
   * @param {Object} amqpSchema AMQP schema
   * @param {any} container DI Container
   */
  constructor(amqpSchema, container) {
    this.container = container;
    this.amqpLogger = container['amqp_logger'];
    this.processors = {};
    this.amqpSchema = amqpSchema;

    const { host, user, pass, vhost } = amqpSchema['connection'];
    return connect(`amqp://${user}:${pass}@${host + vhost}`)
      .then((connection) => {
        this.connection = connection;
        return this.connection.createChannel();
      })
      .then(async(ch) => {
        await this.initializeProcessors(ch, amqpSchema);
        await this.initializeQueues(ch, amqpSchema['queues']);
      })
      .catch((err) => {
        this.amqpLogger.error(err);
        if (this.connection) {
          this.connection.close();
        }
      })
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

      this.amqpLogger.debug(`[x] started consumer to queue: ${queueName}`);

      for(let binding of bindings) {
        Object.keys(binding).forEach(exchange => {
          ch.assertExchange(exchange, 'topic', { durable: true });
          ch.bindQueue(queueName, exchange, binding[exchange]);

          ch.consume(queueName, (msg) => {
            try {
              this.amqpLogger.debug(`[x] message before: ${msg.content.toString()}`)
              consumeMessage(msg, this.processors);
              ch.ack(msg);
            } catch (err) {
              this.amqpLogger.error(err);
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
   * @param {Object} ch AMQP channel instance
   * @param {Object} amqpSchema AMQP schema
   */
  async initializeProcessors(ch, amqpSchema) {
    const processorsHandler = new ProcessorsHandler(ch, amqpSchema, this.container);
    this.processors = processorsHandler.getProcessors();
    return;
  }
}

module.exports = AmqpConnection;