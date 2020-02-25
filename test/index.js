const { join } = require('path');
const createAmqpConnection = require('../index');
const stockCrawl = require('./processors/stockCrawl');

const amqpConnection = createAmqpConnection(join(__dirname, 'amqp_config.yml'));

amqpConnection.dependencyInjector.factory('stockCrawl', () => stockCrawl);

amqpConnection.bootstrapAmqpApp();