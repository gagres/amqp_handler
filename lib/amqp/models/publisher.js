class Publisher {
    constructor(ch, exchange) {
        this.channel = ch;
        this.exchange = exchange;
        this.headers = {};
        this.contentType = 'application/json';
        this.deliveryMode = 1;
        this.logger = null;
    }

    publish(routingKey = '', message) {
        const msgBuffer = Buffer.from(JSON.stringify(message));
        const {
            deliveryMode, contentType, headers,
        } = this;

        const logMessage = {
            content: message,
            exchange: this.exchange,
            routingKey: routingKey
        }

        try {
            const publishResult = this.channel.publish(this.exchange, routingKey, msgBuffer, {
                deliveryMode,
                contentType,
                headers
            });

            this.logPublisherResult(logMessage, 'success');
            return publishResult;
        } catch(err) {
            this.logPublisherResult(logMessage, 'error', err);
            return null;
        }
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

    /**
     * log publishing results (error and sucess)
     *
     * @param {any} msg message sent
     * @param {String} status status of the published message
     * @param {Error} err error when exists
     */
    logPublisherResult(msg, status, err = null) {
        let logResult = {
            status,
            msg,
            created_at: new Date().toISOString(),
        };

        const logMessage = `[x] amqp_publisher_result: ${JSON.stringify(logResult)}`;
        if (err) {
            this.logger.error({ err }, logMessage);
        } else {
            this.logger.debug(logMessage);
        }
    }

    setLogger(logger) {
        this.logger = logger;
    }
}

module.exports = Publisher;