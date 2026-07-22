import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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",
});

async function test() {
  try {
    const stream = await openai.chat.completions.create({
      model: "z-ai/glm-5.2",
      messages: [
        {
          role: "system",
          content: "تو آراما هستی؛ یک همراه همدل فارسی‌زبان.",
        },
        { role: "user", content: "سلام" },
      ],
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      seed: 42,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        process.stdout.write(delta);
      }
    }
    console.log("\nSuccess");
  } catch (error: any) {
    console.error("\nError calling API:", error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

test();
