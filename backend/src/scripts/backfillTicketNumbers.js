const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const env = require('../config/env');
const generateTicketNumber = require('../utils/generateTicketNumber');

const backfillTickets = async () => {
  try {
    console.log('Connecting to database for backfill...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Database connected.');

    // Find incidents without ticketNumber
    const incidents = await Incident.find({
      $or: [
        { ticketNumber: { $exists: false } },
        { ticketNumber: null },
        { ticketNumber: '' }
      ]
    });

    console.log(`Found ${incidents.length} incidents without ticket numbers.`);

    let count = 0;
    for (const incident of incidents) {
      let ticketNumber;
      let isUnique = false;
      let retries = 0;
      
      while (!isUnique && retries < 10) {
        ticketNumber = generateTicketNumber();
        const existing = await Incident.findOne({ ticketNumber });
        if (!existing) {
          isUnique = true;
        }
        retries++;
      }

      if (isUnique) {
        incident.ticketNumber = ticketNumber;
        await incident.save();
        count++;
        console.log(`Assigned ticket ${ticketNumber} to incident ID: ${incident._id}`);
      } else {
        console.error(`Could not generate unique ticket for incident ID: ${incident._id}`);
      }
    }

    console.log(`Backfill completed successfully. Updated ${count} incidents.`);
  } catch (error) {
    console.error(`Error during backfill: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

backfillTickets();
