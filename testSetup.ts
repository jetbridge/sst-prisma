// if running in CI (github actions) we should use the configured DB

import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'desm';

// make SST config not complain about missing Config values
process.env.SST_APP = 'appName';
process.env.SST_STAGE = 'vitest';

const __dirname = dirname(import.meta.url);

if (!process.env.DATABASE_URL && !process.env.CI) {
  dotenv.config({
    path: path.join(__dirname, 'backend', '.env.vitest'),
    debug: true,
  });
}
