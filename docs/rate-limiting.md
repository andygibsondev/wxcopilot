# Rate limiting (call caps)

Daily call limits apply to `/api/weather` and `/api/metar-taf`. Each successful request counts as one call. Limits reset at **midnight UTC**. Data is cached for **5 minutes**; the client will not request a refresh until 5 minutes after the last refresh.

## Plans

| Plan   | Calls/day | Monthly cost |
|--------|-----------|--------------|
| Free   | 200       | —            |
| 900    | 900       | £8.00        |
| 3,600  | 3,600     | £30.00       |
| 18,000 | 18,000    | £140.00      |
| 36,000 | 36,000    | £240.00      |
| 72,000 | 72,000    | £420.00      |

## Setup

1. **Redis (Upstash)**  
   Create a Redis database at [Upstash Console](https://console.upstash.com/), then set in `.env.local`:

   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

   If these are **not** set, rate limiting is **disabled** (all requests allowed). Use this for local development.

2. **Paid plans (API keys)**  
   Optional. Map API keys to plan IDs via `RATE_LIMIT_API_KEYS`:

   ```
   RATE_LIMIT_API_KEYS=key1:900,key2:3600
   ```

   Clients send `x-api-key: key1` (or `key2`) when calling the APIs. Unlisted keys and requests without a key use the **free** plan (200/day), identified by IP.

## Identity

- **With `x-api-key`**  
  Plan comes from `RATE_LIMIT_API_KEYS`. Unknown keys → free.

- **Without `x-api-key`**  
  Identifier = IP (`x-forwarded-for` or `x-real-ip`). Plan = free.

## Response headers

Successful and rate-limited responses include:

- `X-RateLimit-Limit` — daily limit for the plan  
- `X-RateLimit-Remaining` — calls left today (after this request)  
- `X-RateLimit-Reset` — Unix seconds when the daily window resets (midnight UTC)

## 429 when over limit

When the daily limit is exceeded, the API returns `429 Too Many Requests` with a JSON `error` message and the same rate-limit headers. Clients should back off and retry after `X-RateLimit-Reset`.

## Dependencies

```bash
npm install @upstash/redis
```

Implementations live in `lib/plans.ts`, `lib/usage.ts`, and the `/api/weather` and `/api/metar-taf` routes.
