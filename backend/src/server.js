const dotenv = require('dotenv');
const path = require('path');

// Configure environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

// Server configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server URL: http://localhost:${PORT}`);
});
