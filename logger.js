const { join } = require('path');
const bunyan = require('bunyan');

function createLogger(loggerName, { path } = {}) {
  const logger = bunyan.createLogger({
    name: loggerName,
    streams: [
      { level: 'debug', stream: process.stdout },
      { level: 'debug', path: join(path, 'amqp.log') },
    ],
    serializers: {
      err: bunyan.stdSerializers.err,   // serialize error messages
    }
  });

  return logger;
}

module.exports = createLogger;