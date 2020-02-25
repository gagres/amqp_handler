const bunyan = require('bunyan');

function createLogger(loggerName, { path } = {}) {
  const logger = bunyan.createLogger({
    name: loggerName,
    streams: [
      { level: 'debug', stream: process.stdout },
      { level: 'debug', path },
    ]
  });

  return logger;
}

module.exports = createLogger;