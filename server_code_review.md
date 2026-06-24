# GödBusz Server — Code Review

## Overall Impression

The codebase is small, well-organized, and readable. The separation into `routes`, `services`, `middleware`, and `helper` is sensible for its size. Below are findings grouped by severity.

---

## 🔴 High — Security & Correctness

### 1. Open CORS proxy is dangerous

[index.js](file:///home/bence/Development/GödBusz/server/src/index.js#L8-L14) sets `Access-Control-Allow-Origin: *`, and the `/route-proxy` endpoint in [routes.js](file:///home/bence/Development/GödBusz/server/src/routes.js#L14-L35) forwards **any URL path** the client supplies to `osrm.hqnet.hu`. This means:

- Anyone on the internet can use your server as an open proxy to that OSRM instance.
- The `req.url` is spliced directly into the target URL with no validation — a crafted request could exploit path traversal or other unexpected OSRM endpoints.

**Recommendation:**
```js
// Validate and restrict what gets forwarded
const ALLOWED_PROFILE = /^\/driving\/[\d.,;]+$/;

router.use("/route-proxy", asyncHandler(async (req, res) => {
  if (!ALLOWED_PROFILE.test(req.url.split("?")[0])) {
    return res.status(400).json({ error: "Invalid route request" });
  }
  // ...proceed
}));
```

Also lock down the CORS origin to your actual frontend domain instead of `*`.

### 2. No `express.json()` body parser

[index.js](file:///home/bence/Development/GödBusz/server/src/index.js) never calls `app.use(express.json())`. If you ever add POST/PUT routes, request bodies will silently be `undefined`. Worth adding now to avoid a confusing debugging session later.

### 3. Route cache never gets rejected-promise entries cleaned up

In [apiService.js](file:///home/bence/Development/GödBusz/server/src/services/apiService.js#L22-L29), `loadRoute` caches the **promise**, not the resolved data. If the upstream API errors out, that rejected promise sits in the cache for up to an hour and every caller gets the same rejection:

```js
// Current — caches before knowing if it succeeds
const promise = request({ op: "loadRoute", d: date });
routeCache.set(date, { promise, timestamp: new Date().toISOString() });
return promise;
```

**Recommendation:**
```js
loadRoute: async (date) => {
  const cached = routeCache.get(date);
  if (cached && !isTooOld(cached.timestamp)) {
    return cached.data;
  }
  const data = await request({ op: "loadRoute", d: date });
  routeCache.set(date, { data, timestamp: new Date().toISOString() });
  return data;
},
```

---

## 🟡 Medium — Architecture & Data Handling

### 4. Duplicated trip-extraction logic

The alphabet-based trip extraction loop is copy-pasted verbatim between [formatData](file:///home/bence/Development/GödBusz/server/src/helper.js#L31-L89) and [getAllStops](file:///home/bence/Development/GödBusz/server/src/helper.js#L92-L128). Extract it:

```js
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function extractTrips(stop) {
  return ALPHABET
    .map((letter) => ({
      time: stop[`${letter}time`],
      nev:  stop[`${letter}nev`],
      sd:   stop[`${letter}sd`],
      ed:   stop[`${letter}ed`],
    }))
    .filter(({ time, nev, sd, ed }) =>
      time !== null && (time !== undefined || nev !== undefined || sd !== undefined || ed !== undefined)
    );
}
```

### 5. Suspicious null/undefined condition

In the trip filter ([helper.js:47-53](file:///home/bence/Development/GödBusz/server/src/helper.js#L47-L53)):

```js
if (
  time !== null &&
  (time !== undefined || nev !== undefined || sd !== undefined || ed !== undefined)
) { ... }
```

This reads: *"include if time is not null AND at least one field is defined"*. But if `time` is `undefined`, it passes the `!== null` check and gets included anyway (as long as any other field exists). This is almost certainly a bug — you probably want:

```js
if (time != null || nev != null || sd != null || ed != null)
```

### 6. Two separate `routeCache` Maps with different semantics

- [routes.js:12](file:///home/bence/Development/GödBusz/server/src/routes.js#L12) — caches OSRM proxy responses (stores resolved data)
- [apiService.js:4](file:///home/bence/Development/GödBusz/server/src/services/apiService.js#L4) — caches upstream API calls (stores promises)

Both use `isTooOld()` with a hardcoded 1-hour TTL, and neither has a size limit. This is fine for now, but the cache will grow unbounded in memory over time. The OSRM cache is especially concerning since every unique coordinate pair creates a new entry.

**Recommendation:** Add a max-size eviction policy, or use the existing [cache.js middleware](file:///home/bence/Development/GödBusz/server/src/middleware/cache.js) (which is currently unused!).

### 7. `cache.js` middleware is never used

You built a nice [cache middleware](file:///home/bence/Development/GödBusz/server/src/middleware/cache.js) but none of the routes use it. It could replace the manual `routeCache` in `routes.js`. Also note: the middleware only intercepts `res.send()`, not `res.json()` — so it wouldn't work with routes that call `res.json()` unless you also patch that method.

### 8. `getAllBus` can crash on empty routes

[helper.js:130-139](file:///home/bence/Development/GödBusz/server/src/helper.js#L130-L139):
```js
return json.data
  .map((child) => {
    return {
      plate: child[0]?.rendszam.split(",")[0],  // 💥 if rendszam is undefined
      route: child[0]?.jarat,
    };
  })
  .filter(Boolean);
```

`child[0]?.rendszam.split(",")` — the optional chaining stops at `child[0]`, but if `child[0]` exists and `rendszam` is `undefined`, `.split(",")` will throw. Use `child[0]?.rendszam?.split(",")[0]`.

---

## 🟢 Low — Code Quality & Nits

### 9. `JSON.parse(JSON.stringify(stop))` for shallow copy

In [formatData](file:///home/bence/Development/GödBusz/server/src/helper.js#L63), you deep-clone via JSON round-trip just to delete some keys. Use object spread or destructuring instead:

```js
const { lan, lot, ...rest } = stop;
const newStop = { ...rest, lat: lan, lon: lot };
```

### 10. Express 5 has built-in async error handling

Your `package.json` shows `express@^5.2.1`. Express 5 natively catches rejected promises from async route handlers, making `asyncHandler` unnecessary. You can remove it and use `async` handlers directly.

### 11. No rate limiting

Any client can hammer your API endpoints or abuse the OSRM proxy. Consider adding `express-rate-limit` at minimum on the proxy route.

### 12. Hardcoded upstream URLs

The OSRM URL (`https://osrm.hqnet.hu:8083/`) and the API base URL (`https://god.molteam.hu/ajax.php`) are hardcoded. Use environment variables so you can change them without code changes:

```js
const BASE_URL = process.env.API_BASE_URL || "https://god.molteam.hu/ajax.php";
```

### 13. No request timeout on upstream `fetch()` calls

If the OSRM or upstream API hangs, your server will hang too. Add an `AbortSignal.timeout()`:

```js
const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
```

### 14. `app.use(express.static("public"))` path is relative

This resolves relative to `process.cwd()`, not relative to the source file. If the server is started from a different directory, static files won't be found. Use:

```js
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "..", "public")));
```

---

## Summary

| Priority | Issue | Effort |
|----------|-------|--------|
| 🔴 | Lock down CORS & validate proxy paths | Small |
| 🔴 | Fix rejected-promise caching in `apiService` | Small |
| 🟡 | Extract duplicated trip-extraction logic | Small |
| 🟡 | Fix the null/undefined condition bug | Small |
| 🟡 | Add cache size limits or use the unused cache middleware | Medium |
| 🟡 | Fix potential crash in `getAllBus` | Small |
| 🟢 | Remove `asyncHandler` (Express 5 doesn't need it) | Small |
| 🟢 | Add fetch timeouts, rate limiting, env vars | Medium |

The codebase is clean for its size. The highest-impact wins are fixing the proxy security, the cache bug, and deduplicating the trip extraction — all quick changes.
