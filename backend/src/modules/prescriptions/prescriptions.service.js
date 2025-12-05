// prescriptions.service.js - Mongoose-backed service
const PrescriptionEvent = require('../../db/models/PrescriptionEvent');

module.exports = {
  async list(filter = {}) {
    return PrescriptionEvent.find(filter).sort({ createdAt: -1 }).lean().exec();
  },

  async getById(id) {
    return PrescriptionEvent.findById(id).lean().exec();
  },

  async create(data) {
    const doc = await PrescriptionEvent.create(data);
    return PrescriptionEvent.findById(doc._id).lean().exec();
  },

  async update(id, data) {
    await PrescriptionEvent.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    return PrescriptionEvent.findById(id).lean().exec();
  }
};
