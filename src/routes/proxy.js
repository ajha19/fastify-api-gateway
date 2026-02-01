
module.exports = async function proxyRoutes(fastify, opts) {
    // In-memory store for rate limiting: Map<ip, Array<timestamp>>
    const rateLimitStore = new Map();

    // Proxy all /api/* requests to upstream
    fastify.all('/api/*', async (request, reply) => {
        // Rate limiting logic - sliding window
        const clientIP = request.ip || 'unknown';
        const now = Date.now();
        const windowMs = opts.rateLimitWindowMs;
        const maxRequests = opts.rateLimitMaxRequests;

        let timestamps = rateLimitStore.get(clientIP) || [];

        // Remove timestamps older than window
        timestamps = timestamps.filter(ts => (now - ts) < windowMs);

        if (timestamps.length >= maxRequests) {
            // Rate limited
            request.log.warn({
                msg: 'Rate limit exceeded',
                clientIP,
                reqId: request.id,
                count: timestamps.length,
                windowMs
            });
            return reply.status(429).send({
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs}ms.`,
                requestId: request.id
            });
        }

        // Allow request, add timestamp
        timestamps.push(now);
        rateLimitStore.set(clientIP, timestamps);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.upstreamTimeout);

        try {
            const upstreamUrl = opts.upstreamUrl + request.url.replace('/api', '');

            const headers = { ...request.headers };
            delete headers.host; // Avoid host header issues
            headers['x-request-id'] = request.id;

            const response = await fetch(upstreamUrl, {
                method: request.method,
                headers,
                body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const responseBody = await response.text();
            const responseHeaders = {};

            // Copy relevant headers
            for (const [key, value] of response.headers.entries()) {
                if (key.toLowerCase() !== 'transfer-encoding') {
                    responseHeaders[key] = value;
                }
            }

            reply.status(response.status).headers(responseHeaders).send(responseBody);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                request.log.error({ msg: 'Upstream timeout', url: request.url, timeout: opts.upstreamTimeout });
                reply.status(504).send({ error: 'Gateway Timeout', requestId: request.id });
            } else {
                request.log.error(error);
                reply.status(502).send({ error: 'Bad Gateway', requestId: request.id });
            }
        }
    });
};
