const crypto = require('crypto');

/**
 * Generates a human-readable, unique-like ticket number: DC-YYYYMMDD-XXXXX
 * where XXXXX is a random 5-digit number.
 * @returns {string}
 */
const generateTicketNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // crypto.randomInt(min, max) -> generates range [min, max)
  // To get a 5-digit number from 10000 to 99999 inclusive:
  const randomVal = crypto.randomInt(10000, 100000);

  return `DC-${dateStr}-${randomVal}`;
};

module.exports = generateTicketNumber;
