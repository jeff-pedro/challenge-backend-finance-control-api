import { promisify } from 'util';

export default (list) => {
  const setAsync = promisify(list.set).bind(list);
  const existsAsync = promisify(list.exists).bind(list);
  const getAsync = promisify(list.get).bind(list);
  const delAsync = promisify(list.del).bind(list);

  return {
    async add(key, value, expirationDate) {
      await setAsync(key, value);
      list.expireat(key, expirationDate);
    },
    async containKey(key) {
      const result = await existsAsync(key);
      return result === 1;
    },
    async findValue(key) {
      return getAsync(key);
    },
    async delete(key) {
      delAsync(key);
    },
  };
};
