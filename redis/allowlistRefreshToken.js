import { createClient } from 'redis';
import listHandler from './listHandler.js';

const allowlist = createClient({ prefix: 'allowlist-refresh-token: ' });

export default listHandler(allowlist);
