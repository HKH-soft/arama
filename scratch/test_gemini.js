const apiKey = "AQ.Ab8RN6IWTJqmO5ZOGgKTBDN_ZHx50qsb0mCKcuq1t2TaurhJaA";

async function testBearer(modelName) {
  console.log(`\n--- Bearer Test model: ${modelName} ---`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: "Hello" }]
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

async function run() {
  await testBearer("gemini-1.5-flash");
}

run();
