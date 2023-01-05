import { createClient } from 'redis';
import listHandler from './listHandler.js';
import { InternalServerError } from '../src/helpers/errorHandler.js';

const prefix = 'allowlist-refresh-token: ';
let allowlist;

(async () => {
  // Create redis client
  allowlist = createClient({
    url: process.env.REDIS_URL,
  });

  allowlist.on('error', (err) => console.log('Redis Client Error', err));
  try {
    // Connect to redis server
    await allowlist.connect();
  } catch (err) {
    throw new InternalServerError(`Redis Connection ${err}`);
  }
})();

export default listHandler(allowlist, prefix);
