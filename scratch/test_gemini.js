const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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",
});

async function test() {
  console.log("Testing NVIDIA API with GLM-5.2...");
  try {
    const stream = await client.chat.completions.create({
      model: "z-ai/glm-5.2",
      messages: [
        {
          role: "system",
          content: "تو «آراما» هستی؛ یک همراه گفتگومحور فارسی‌زبان برای لحظه‌های سخت روزمره."
        },
        { role: "user", content: "سلام، امروز حالم خوب نیست" }
      ],
      temperature: 0.9,
      max_tokens: 600,
      stream: true,
    });

    console.log("✅ Stream started!");
    let complete = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        complete += delta;
        process.stdout.write(delta);
      }
    }
    console.log("\n\n✅ Complete response length:", complete.length);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
