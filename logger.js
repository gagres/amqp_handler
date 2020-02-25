const { join } = require('path');
const bunyan = require('bunyan');

function createLogger(loggerName, { path } = {}) {
  const logger = bunyan.createLogger({
    name: loggerName,
    streams: [
      { level: 'debug', stream: process.stdout },
      { level: 'debug', path: join(path, 'amqp.log') },
    ]
  });

  return logger;
}

module.exports = createLogger;