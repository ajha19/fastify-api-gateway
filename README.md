# Fastify API Gateway

A production-style API gateway built with Fastify.

## Setup

1. Install dependencies: \`npm install\`
1. Install dependencies: `npm install`
2. Copy `.env` and adjust as needed.
3. Run development server: `npm run dev`
4. Run production server: `npm start`

## Proxy Routes

- `GET/POST/PUT/etc /api/*` → Proxied to upstream service (rate limited per IP)

## Rate Limiting

- Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`
- Sliding window algorithm to prevent boundary bursts
- Applied per client IP on `/api/*` routes
- Returns 429 "Too Many Requests" with request ID when exceeded
- Logs rate limit events with request details

## Testing

## Health Check

Visit `http://localhost:3000/health` to check server status.
