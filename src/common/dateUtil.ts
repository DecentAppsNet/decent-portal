// A really trivial function, but useful for testing purposes because it
// can be mocked to return a fixed value.
/* v8 ignore start */
export function now() {
  return Date.now();
}
/* v8 ignore end */