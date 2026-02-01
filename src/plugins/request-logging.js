const crypto = require('crypto');

module.exports = async function requestLoggingPlugin(fastify, opts) {
    // onRequest hook: start timing and create child logger
    fastify.addHook('onRequest', async (request, reply) => {
        request.id = crypto.randomUUID();
        request.startTime = process.hrtime.bigint();
        // Create child logger with request ID
        request.log = request.log.child({ reqId: request.id });
        // Log incoming request
        request.log.info({ msg: 'incoming request', method: request.method, url: request.url });
    });

    // onResponse hook: log response details
    fastify.addHook('onResponse', async (request, reply) => {
        const duration = Number(process.hrtime.bigint() - request.startTime) / 1e6; // milliseconds
        request.log.info({
            msg: 'request completed',
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            duration: `${duration.toFixed(2)}ms`
        });
    });
};
