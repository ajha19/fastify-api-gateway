const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
    return { message: 'Upstream Service is Running! 🚀', endpoints: ['/users', '/slow'] };
});

fastify.get('/users', async (request, reply) => {
    return { users: [{ id: 1, name: 'John Doe' }], requestId: request.headers['x-request-id'] };
});

fastify.post('/users', async (request, reply) => {
    return { message: 'User created', requestId: request.headers['x-request-id'] };
});

// Simulate slow response
fastify.get('/slow', async (request, reply) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { message: 'Slow response', requestId: request.headers['x-request-id'] };
});

const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        console.log('Dummy upstream server listening on http://localhost:4000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
