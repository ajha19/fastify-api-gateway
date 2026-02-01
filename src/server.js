const fastify = require('fastify');
const crypto = require('crypto');
const config = require('./config');

function buildServer() {
    const server = fastify({
        logger: {
            level: config.logLevel,
            // Can customize serializers if needed
            serializers: {
                req: (req) => ({
                    method: req.method,
                    url: req.url,
                    id: req.id
                }),
                res: (res) => ({
                    statusCode: res.statusCode
                })
            }
        },
        genReqId: (req) => crypto.randomUUID()
    });

    // Register plugins
    server.register(require('@fastify/static'), {
        root: require('path').join(__dirname, 'public'),
    });
    server.register(require('./plugins/request-logging'));
    server.register(require('./plugins/health'));
    server.register(require('./plugins/error-handler'));

    // Register routes
    server.register(require('./routes/proxy'), {
        upstreamUrl: config.upstreamUrl,
        upstreamTimeout: config.upstreamTimeout,
        rateLimitMaxRequests: config.rateLimitMaxRequests,
        rateLimitWindowMs: config.rateLimitWindowMs
    });

    // Custom 404 handler to include request ID
    server.setNotFoundHandler(async (request, reply) => {
        reply.status(404).send({ message: 'Route not found', requestId: request.id });
    });

    return server;
}

module.exports = buildServer;
