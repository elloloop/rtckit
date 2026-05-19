// Minimal ambient shims for the zero-dependency test runner. The OSS core
// itself has NO node dependency (browser-targeted); only *.test.ts use
// these, and we deliberately avoid pulling @types/node into the package
// just to run a handful of pure unit tests via `node --test`.
declare module 'node:test' {
  export function test(
    name: string,
    fn: () => void | Promise<void>,
  ): void;
}
declare module 'node:assert/strict' {
  interface StrictAssert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
  }
  const assert: StrictAssert;
  export default assert;
}
