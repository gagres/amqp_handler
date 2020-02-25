const { crawlStock } = require('../utils/crawl');

class StockCrawlProcessor {
  constructor(ch, container) {
    this.channel = ch;
    this.amqpLogger = container['amqp_logger'];
  }

  /**
   * process message
   * @param {Object} messageData Message data property
   */
  async process(message) {
    const { data: messageData } = message.content;

    if (Array.isArray(messageData) && messageData.length > 0  ) {
      for(const stockName of messageData) {
        if (typeof stockName === 'string') {
          const stockInfo = await this.getStockInfo(stockName);
          if (stockName.error) {
            this.sendStockInfo(stockInfo.error, fields);
          } else {
            this.sendStockInfo(stockInfo, message.fields);
          }
        }
      }
    } else {
      throw new Error(`list of stock's names required`);
    }
  }

  /**
   * crawl stock on fundamentus.com.br and get stock info
   * @param {Object} stockName stock name
   */
  async getStockInfo(stockName) {
    this.amqpLogger.debug(`get stock info: ${stockName}`);
    return await crawlStock(stockName);
  };

  /**
   * send stock info on rabbitmq
   * @param {Object} stockInfo stock info
   */
  sendStockInfo(stockInfo, fields) {
    this.amqpLogger.debug(`sending stock info: ${JSON.stringify(stockInfo)}`);
    this.channel.publish('global', `${fields['routingKey']}.result`, Buffer.from(JSON.stringify(stockInfo)));
  }
}

let stockCrawlInstance;
module.exports = (ch, container) => {
  if (!stockCrawlInstance) {
    stockCrawlInstance = new StockCrawlProcessor(ch, container);
  }

  return stockCrawlInstance;
};