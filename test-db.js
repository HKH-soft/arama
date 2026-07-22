const { db } = require('./src/db/index.js');
const { meditationTracks } = require('./src/db/schema.js');
const { demoTracks } = require('./src/lib/demo-data.js');

async function test() {
  try {
    const { eq } = require('drizzle-orm');
    const existing = await db.select({ id: meditationTracks.id }).from(meditationTracks);
    console.log("Existing tracks:", existing.length);
    if (existing.length < demoTracks.length) {
      console.log("Deleting existing tracks...");
      await db.delete(meditationTracks);
      console.log("Inserting new tracks...");
      await db.insert(meditationTracks).values(demoTracks);
      console.log("Done!");
    } else {
      console.log("No need to update.");
    }
  } catch (e) {
    console.error(e);
  }
}
test();
