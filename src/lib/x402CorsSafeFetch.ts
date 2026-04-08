/**
 * @x402/fetch (wrapFetchWithPayment) incorrectly sets "Access-Control-Expose-Headers" on the
 * outbound Request. That name is a *response* CORS header; as a request header it triggers
 * browser preflight and fails unless the API allows it — and it should not be sent at all.
 * Strip it before calling fetch so Pay AI / x402 flow works from browsers (e.g. localhost).
 */
const EXPOSE_HEADERS_LC = 'access-control-expose-headers';

function stripMisplacedExposeHeaders(req: Request): Request {
  const headers = new Headers(req.headers);
  let changed = false;
  for (const key of [...headers.keys()]) {
    if (key.toLowerCase() === EXPOSE_HEADERS_LC) {
      headers.delete(key);
      changed = true;
    }
  }
  if (!changed) return req;

  const init: RequestInit = {
    method: req.method,
    headers,
    mode: req.mode,
    credentials: req.credentials,
    cache: req.cache,
    redirect: req.redirect,
    referrer: req.referrer,
    referrerPolicy: req.referrerPolicy,
    integrity: req.integrity,
    keepalive: req.keepalive,
    signal: req.signal,
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body != null) {
    init.body = req.body;
    (init as RequestInit & { duplex?: string }).duplex = 'half';
  }
  return new Request(req.url, init);
}

export function createCorsSafeFetchForX402(baseFetch: typeof fetch): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    return baseFetch(stripMisplacedExposeHeaders(req));
  };
}
