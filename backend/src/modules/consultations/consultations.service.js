let store = [];
exports.list = async () => store;
exports.getById = async (id) => store.find(s=>s._id===id);
exports.create = async (data) => {
  const obj = { ...data, _id: (Math.random()*1e18).toString(36), createdAt: new Date() };
  store.push(obj); return obj;
};
exports.update = async (id, data) => {
  const i = store.findIndex(s=>s._id===id);
  if (i<0) return null;
  store[i] = { ...store[i], ...data }; return store[i];
};
