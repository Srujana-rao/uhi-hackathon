let store = {};
exports.getForPatient = async (patientId) => store[patientId] || { patientId, events: [] };
