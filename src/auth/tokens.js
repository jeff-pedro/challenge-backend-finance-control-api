import jwt from 'jsonwebtoken';
import moment from 'moment';
import { randomBytes } from 'crypto';
import blocklistAccessToken from '../../redis/blocklistAccessToken.js';
import allowlistRefreshToken from '../../redis/allowlistRefreshToken.js';
import { InvalidArgumentError } from '../helpers/errorHandler.js';

async function checkTokenInBlocklist(token, name, blocklist) {
  if (!blocklist) {
    return;
  }

  const tokenInBlocklist = await blocklist.tokenExists(token);
  if (tokenInBlocklist) {
    throw new jwt.JsonWebTokenError(`invalid ${name} by logout`);
  }
}

function checkUser(id, name) {
  if (!id) {
    throw new InvalidArgumentError(`${name} invalid`);
  }
}

function checkToken(token, name) {
  if (!token) {
    throw new InvalidArgumentError(`no ${name} provided`);
  }
}

function createTokenJWT(id, [expAmount, expUnit]) {
  const payload = { id };
  const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: expAmount + expUnit });
  return token;
}

async function verifyTokenJWT(token, name, blocklist) {
  await checkTokenInBlocklist(token, name, blocklist);
  const { id } = jwt.verify(token, process.env.JWT_KEY);
  return id;
}

async function invalidateTokenJWT(token, blocklist) {
  await blocklist.add(token);
}

async function createOpaqueToken(id, [expAmount, expUnit], allowlist) {
  const opaqueToken = randomBytes(24).toString('hex');
  const expirationDate = moment().add(expAmount, expUnit).unix();
  await allowlist.add(opaqueToken, id, expirationDate);
  return opaqueToken;
}

async function verifyOpaqueToken(token, name, allowlist) {
  checkToken(token, name);
  const id = await allowlist.findValue(token);
  checkUser(id, name);
  return id;
}

async function invalidateOpaqueToken(token, allowlist) {
  await allowlist.delete(token);
}

export default {
  access: {
    name: 'access token',
    list: blocklistAccessToken,
    expiration: [15, 'm'],
    create(id) {
      return createTokenJWT(id, this.expiration);
    },
    async verify(token) {
      return verifyTokenJWT(token, this.name, this.list);
    },
    async invalidate(token) {
      return invalidateTokenJWT(token, this.list);
    },
  },
  refresh: {
    name: 'refresh token',
    list: allowlistRefreshToken,
    expiration: [5, 'd'],
    create(id) {
      return createOpaqueToken(id, this.expiration, this.list);
    },
    verify(token) {
      return verifyOpaqueToken(token, this.name, this.list);
    },
    invalidate(token) {
      return invalidateOpaqueToken(token, this.list);
    },
  },
  emailChecking: {
    name: 'email checking token',
    expiration: [1, 'h'],
    create(id) {
      return createTokenJWT(id, this.expiration);
    },
    verify(token) {
      return verifyTokenJWT(token, this.name);
    },
  },
};
