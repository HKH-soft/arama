import { ensurePlans } from "./src/lib/demo-data";

async function main() {
  try {
    await ensurePlans();
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
