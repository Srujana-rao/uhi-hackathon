require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
