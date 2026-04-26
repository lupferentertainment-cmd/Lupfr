/**
 * Must run before any file imports `react` / `react-dom`.
 * React 19 CJS: `act` exists only on `react.development.js` (`exports.act` is omitted in
 * `react.production.js`). Vercel/CI set NODE_ENV=production for the whole build, so Vitest
 * would otherwise load the production entry and @testing-library/react throws
 * "React.act is not a function" (see react-dom cjs `react-dom-test-utils.production.js`).
 */
if (process.env.NODE_ENV === "production") {
  process.env.NODE_ENV = "test"
}
