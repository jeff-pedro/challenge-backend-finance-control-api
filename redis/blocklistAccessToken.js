import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { createClient } from 'redis';
import listHandler from './listHandler.js';

const blocklist = createClient({ prefix: 'blocklist-access-token: ' });
const blocklistHandler = listHandler(blocklist);

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