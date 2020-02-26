class Message {
  constructor({ fields, content, properties }) {
    this.validateFields(fields)
    this.validateProperties(properties);
    this.validateContent(content);
  }

  /**
   * validate AMQP message fields
   * @param {Object} fields AMQP message fields
   */
  validateFields(fields) {
    this.fields = fields;
  }

  /**
   * Validate AMQP message properties
   * @param {Object} properties AMQP message properties
   */
  validateProperties(properties) {
    if (properties['contentType'] !== 'application/json') {
      throw new Error('invalid content_type');
    }

    this.properties = properties;
  }

  /**
   * Validate AMQP message content
   * @param {Buffer} content AMQP messsage content
   */
  validateContent(content) {
    let contentJson;
    try {
      contentJson = JSON.parse(content.toString());
    } catch(err) {
      throw new Error('content is not json');
    }

    if (!contentJson['type']) {
      throw new Error('content invalid: not found type property');
    }

    if (!contentJson['data']) {
      throw new Error('content invalid: not found data property');
    }

    if (!(Array.isArray(contentJson['data'])) && !(typeof contentJson['data'] === 'object')) {
      throw new Error('content invalid: data property is not an object or a valid array');
    }

    this.content = contentJson;
  }
}

module.exports = Message;