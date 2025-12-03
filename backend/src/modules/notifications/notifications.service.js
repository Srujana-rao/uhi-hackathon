let store = {};
exports.listForUser = async userId => store[userId] || [];
exports.send = async payload => {
  const id = (Math.random()*1e18).toString(36);
  const entry = { id, ...payload, createdAt: new Date() };
  if (payload.to) {
    store[payload.to] = store[payload.to] || [];
    store[payload.to].push(entry);
  }
  return entry;
};
