class Publisher {
    constructor(ch, exchange) {
        this.channel = ch;
        this.exchange = exchange;
        this.headers = {};
        this.contentType = 'application/json';
        this.deliveryMode = 1;
    }

    publish(routingKey = '', message) {
        const msgBuffer = Buffer.from(JSON.stringify(message));
        const {
            deliveryMode, contentType, headers,
        } = this;

        return this.channel.publish(this.exchange, routingKey, msgBuffer, {
            deliveryMode,
            contentType,
            headers
        })
    }

    setExchange(exchange = 'global') {
        this.exchange = exchange;
    }

    addHeader(headerName, headerValue) {
        this.headers[headerName] = headerValue;
    }

    setContentType(contentType = 'application/json') {
        this.contentType = contentType;
    }

    setDeliveryMode(deliveryMode = 1) {
        this.deliveryMode = deliveryMode;
    }
}

module.exports = Publisher;