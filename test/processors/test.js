class TestProcessor {
    process(message) {
        console.log(`Example of amqp message handler: ${JSON.stringify(message)}`)
    }
}


let testInstance;
module.exports = (ch, container) => {
  if (!testInstance) {
    testInstance = new TestProcessor(ch, container);
  }

  return testInstance;
};