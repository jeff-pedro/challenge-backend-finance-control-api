import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { createClient } from 'redis';
import listHandler from './listHandler.js';

const prefix = 'blocklist-access-token: ';

const blocklist = createClient({
  url: process.env.REDIS_URL,
});

let blocklistHandler;

(async () => {
  // Connect to redis server
  await blocklist.connect();

  blocklistHandler = listHandler(blocklist, prefix);
})();

function generateTokenHash(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

export default ({
  add: async (token) => {
    const expirationDate = jwt.decode(token).exp;
    const tokenHash = generateTokenHash(token);
    await blocklistHandler.add(tokenHash, '', expirationDate);
  },
  tokenExists: async (token) => {
    const tokenHash = generateTokenHash(token);
    return blocklistHandler.containKey(tokenHash);
  },
});
