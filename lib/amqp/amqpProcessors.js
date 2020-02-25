class ProcessorsHandler {
  /**
   * Instantiate a amqp connection
   * @constructor
   * @param {any} ch AMQP channel instance
   * @param {Object} amqpSchema AMQP schema
   * @param {any} container DI Container
   */
  constructor(ch, amqpSchema, container) {
    this.channel = ch;
    this.processors = {};
    this.container = container;
    this.initializeProcessors(amqpSchema);
  }

  /**
   * initialize processors list
   * @param {Object} amqpSchema AMQP schema
   */
  initializeProcessors(amqpSchema) {
    const { processors } = amqpSchema;
    Object.keys(processors).forEach(processorName => {
      const processor = processors[processorName];

      if (processor['listeners']) {
        for(const listener of processor['listeners']) {
          Object.keys(listener).forEach(eventType => {
            const actionName = listener[eventType];

            if (amqpSchema[actionName]) {
              const classReference = amqpSchema[actionName]['class'];
              if (classReference) {
                const action = this.container[classReference];
                this.addProcessor(eventType, action(this.channel, this.container));
              } else {
                throw new Error(`class reference property not found to action type: ${actionName}`);
              }
            } else {
              throw new Error(`invalid processor class reference: ${actionName} to event type: ${eventType}`);
            }
          })
        }
      }
    });
  }

  addProcessor(eventType, action) {
    this.processors[eventType] = action;
  }

  getProcessors() {
    return this.processors;
  }
}

module.exports = ProcessorsHandler;