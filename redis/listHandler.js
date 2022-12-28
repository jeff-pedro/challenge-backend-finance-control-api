export default (list, prefix) => ({
  async add(key, value, expirationDate) {
    await list.set(`${prefix}${key}`, value, 'EX', expirationDate);
  },
  async containKey(key) {
    const result = await list.exists(`${prefix}${key}`);
    return result === 1;
  },
  async findValue(key) {
    return list.get(`${prefix}${key}`);
  },
  async delete(key) {
    list.del(`${prefix}${key}`);
  },
});
