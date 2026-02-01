module.exports = async function errorHandlerPlugin(fastify, opts) {
    fastify.setErrorHandler(async (error, request, reply) => {
        fastify.log.error(error);
        request.log.error(error);

        // In production, don't leak error details
        const statusCode = error.statusCode || 500;
        const message = statusCode >= 500 ? 'Internal Server Error' : error.message;

        reply.status(statusCode).send({ error: message, requestId: request.id });
    });
};
