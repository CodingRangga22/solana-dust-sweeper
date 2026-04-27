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

  // Important: don't manually recompose RequestInit (can cause browser TypeError).
  // Recreate the request by cloning the existing one and overriding headers only.
  return new Request(req, { headers });
}

export function createCorsSafeFetchForX402(baseFetch: typeof fetch): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    return baseFetch(stripMisplacedExposeHeaders(req));
  };
}
