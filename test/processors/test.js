class TestProcessor {
  constructor(container) {
    this.publisher = container['publisher'];
  }

  process(message) {
    console.log(`Example of amqp message handler: ${JSON.stringify(message)}`)
    this.publisher.publish('hello.world', {key: 'value'});
  }
}


let testInstance;
module.exports = (container) => {
  if (!testInstance) {
    testInstance = new TestProcessor(container);
  }

  return testInstance;
};