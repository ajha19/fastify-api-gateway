module.exports = async function healthPlugin(fastify, opts) {
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
};
