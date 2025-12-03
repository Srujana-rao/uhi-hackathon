/**
 * In-memory stub for staff module.
 * Replace later with real DB using the Staff mongoose model.
 */

let store = [];

// GET all staff
exports.list = async () => store;

// GET staff by ID
exports.getById = async (id) => store.find(item => item._id === id);

// CREATE staff
exports.create = async (data) => {
  const newItem = {
    ...data,
    _id: (Math.random() * 1e18).toString(36),
    createdAt: new Date()
  };
  store.push(newItem);
  return newItem;
};

// UPDATE staff
exports.update = async (id, data) => {
  const index = store.findIndex(item => item._id === id);
  if (index === -1) return null;

  store[index] = { ...store[index], ...data, updatedAt: new Date() };
  return store[index];
};

// DELETE staff
exports.remove = async (id) => {
  store = store.filter(item => item._id !== id);
  return;
};
