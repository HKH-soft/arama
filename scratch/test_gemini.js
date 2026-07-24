const apiKey = "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";

async function test(modelName) {
  console.log(`\n--- ${modelName} ---`);
  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "تو یک همراه فارسی‌زبان سلامت روان هستی. کوتاه و همدلانه پاسخ بده." },
          { role: "user", content: "امروز خیلی استرس دارم و نمی‌دونم چیکار کنم" }
        ],
        max_tokens: 300
      })
    });

    const data = await res.json();
    const elapsed = Date.now() - start;
    console.log(`Status: ${res.status} | Time: ${elapsed}ms`);
    if (data.choices && data.choices[0]) {
      console.log(`✅ پاسخ: ${data.choices[0].message.content}`);
    } else {
      console.log(`❌ Error:`, data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
  }
}

async function run() {
  await test("poolside/laguna-s-2.1:free");
  await test("poolside/laguna-m.1:free");
  await test("nvidia/nemotron-3-ultra-550b-a55b:free");
}

run();
