const { join } = require('path');
const createAmqpConnection = require('../index');
const testProcessor = require('./processors/test');

const amqpConnection = createAmqpConnection(join(__dirname, 'amqp_config.yml'));

amqpConnection.dependencyInjector.factory('testProcessor', () => testProcessor);

amqpConnection.bootstrapAmqpApp();