const store = new Map();

/** Returns a cached value for `key`, or runs `loader` and keeps the result for `ttlMs`. */
async function remember(key, ttlMs, loader) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loader();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

module.exports = { remember };
