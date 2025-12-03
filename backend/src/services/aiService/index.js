const mode = process.env.AI_MODE || 'mock';
if (mode === 'live') {
  module.exports = require('./live');
} else {
  module.exports = require('./mock');
}
