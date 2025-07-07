// Putting these in separate module makes them mockable in tests.

/* v8 ignore start */
export function windowLocationPathname() {
  return window.location.pathname;
}
/* v8 ignore end */