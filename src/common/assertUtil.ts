/* istanbul ignore file */

/* Keep the terser config of pure functions within vite.config.ts including
   any exports from this module so that they strip out of bundles. */

export function assertNonNullable<T>(x:T, message:string = 'Value is unexpectedly undefined/null.'): 
    asserts x is NonNullable<T> {
  if (x === undefined || x === null) throw new Error(message);
}

export function assertTruthy<T>(condition:T, message:string = 'Condition is unexpectedly falsy.'):
    asserts condition is Exclude<T, 0 | false | '' | null | undefined>{
  if (!condition) throw new Error(message);
}

export function assert(condition:boolean, message:string = 'Assertion failed.'):
    asserts condition {
  if (!condition) throw new Error(message);
}

export function botch(message:string = 'Botched!'):never {
  throw new Error(message);
}