import { createClient } from 'redis';
import listHandler from './listHandler.js';

const prefix = 'allowlist-refresh-token: ';

const allowlist = createClient({
  url: process.env.REDIS_URL,
});

(async () => {
  // Connect to redis server
  await allowlist.connect();
})();

export default listHandler(allowlist, prefix);
