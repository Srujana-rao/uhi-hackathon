let store = {};
exports.getForPatient = async (patientId) => store[patientId] || { patientId, sections: [] };
exports.createSuggestion = async (patientId, payload) => {
  const entry = { id: (Math.random()*1e18).toString(36), patientId, payload, createdAt: new Date() };
  store[patientId] = store[patientId] || { patientId, sections: [] };
  store[patientId].sections.push(entry);
  return entry;
};
