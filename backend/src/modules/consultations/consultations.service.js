// consultations.service.js - Mongoose-backed service
const ConsultationEvent = require('../../db/models/ConsultationEvent');

module.exports = {
  // list(filter) -> returns array
  async list(filter = {}, { lean = true } = {}) {
    const q = ConsultationEvent.find(filter).sort({ createdAt: -1 });
    return lean ? q.lean().exec() : q.exec();
  },

  // getById(id) -> single doc or null
  async getById(id) {
    return ConsultationEvent.findById(id).lean().exec();
  },

  // create(data) -> created doc
  async create(data) {
    const doc = await ConsultationEvent.create(data);
    return ConsultationEvent.findById(doc._id).lean().exec();
  },

  // update(id, data) -> updated doc
  async update(id, data) {
    await ConsultationEvent.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    return ConsultationEvent.findById(id).lean().exec();
  }
};
