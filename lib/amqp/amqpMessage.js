const Message = require('./message');

class MessageHandler {
  /**
   * Instantiate message handler object
   * @param {Object} msg amqplib message
   * @param {Object} processors message processors
   */
  constructor(msg, processors) {
    this.processors = processors;
    this.message = new Message(msg);
  }

  /**
   * consume message
   */
  consume() {
    const { type } = this.message.content;
    const processor = this.processors[type];

    if (!processor) {
      throw new Error(`processor to event type: "${type}" not found`);
    }

    processor.process(this.message);
  }
}

/**
 * consume amqp message
 * @param {Object} msg amqplib message
 * @param {Object} processors message processors
 */
function consumeMessage(msg, processors) {
  const messageHandler = new MessageHandler(msg, processors);
  messageHandler.consume();
}

module.exports = consumeMessage;