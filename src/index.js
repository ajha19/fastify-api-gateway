const buildServer = require('./server');
const config = require('./config');

async function start() {
    const server = buildServer();

    try {
        await server.listen({ port: config.port, host: config.host });
        server.log.info(`Server listening on http://${config.host}:${config.port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

start();
