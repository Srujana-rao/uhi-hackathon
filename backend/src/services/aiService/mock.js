const fs = require('fs');
const path = require('path');

function read(template) {
  try {
    const p = path.join(__dirname, 'templates', template);
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

async function transcribeAudio(audioPath) {
  // return sample transcript text
  const obj = read('mock_transcript.json');
  return obj?.text || 'Patient complains of cough and fever for 3 days.';
}

async function generateSOAP(transcript) {
  const obj = read('mock_soap.json');
  return obj;
}

async function extractMeds(imagePath) {
  const obj = read('mock_meds.json');
  return obj.medications || [];
}

async function generateLhpSuggestionsFromConsultation(consultation) {
  const obj = read('mock_lhp_suggestions.json');
  return obj.suggestions || [];
}

module.exports = {
  transcribeAudio,
  generateSOAP,
  extractMeds,
  generateLhpSuggestionsFromConsultation,
  generateLhpSuggestionsFromPrescription: generateLhpSuggestionsFromConsultation
};
