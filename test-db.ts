import { db } from './src/db/index';
import { meditationTracks } from './src/db/schema';
import { demoTracks } from './src/lib/demo-data';

async function test() {
  try {
    const existing = await db.select({ id: meditationTracks.id }).from(meditationTracks);
    console.log("Existing tracks:", existing.length);
    if (existing.length < demoTracks.length) {
      console.log("Deleting existing tracks...");
      await db.delete(meditationTracks);
      console.log("Inserting new tracks...", demoTracks.length);
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
