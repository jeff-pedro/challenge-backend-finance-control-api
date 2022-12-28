import { createClient } from 'redis';
import listHandler from './listHandler.js';

const allowlist = createClient({
  url: process.env.REDIS_URL,
  prefix: 'allowlist-refresh-token: ',
});

(async () => {
  // Connect to redis server
  await allowlist.connect();
})();

export default listHandler(allowlist);
