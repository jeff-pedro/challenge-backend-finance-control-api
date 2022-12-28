export default (list) => ({
  async add(key, value, expirationDate) {
    await list.set(key, value, 'EX', expirationDate);
  },
  async containKey(key) {
    const result = await list.exists(key);
    return result === 1;
  },
  async findValue(key) {
    return list.get(key);
  },
  async delete(key) {
    list.del(key);
  },
});
