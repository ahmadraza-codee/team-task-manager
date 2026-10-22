
/**
 * Data layer with a single interface and two implementations:
 *  - Postgres (pg) when DATABASE_URL is set  -> GCP Cloud SQL in production
 *  - In-memory fallback when DATABASE_URL is absent -> `npm run dev` works instantly, no DB setup needed
 * Routes only call these functions, never SQL / arrays directly.
 */
require('dotenv').config();
const usePg = Boolean(process.env.DATABASE_URL);
let impl;
if (usePg) {
  console.log('[db] Using PostgreSQL');
  impl = require('./postgres');
} else {
  console.log('[db] DATABASE_URL not set - using in-memory fallback (dev/demo only)');
  impl = require('./memory');
}
module.exports = impl;
