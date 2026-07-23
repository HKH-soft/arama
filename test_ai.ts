import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6I4Zh4pqrSrmAMcDFkgLCHJxVVjGRfGoqAQEzmZBxUaRQ";

const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: apiKey,
});

async function test() {
  try {
    const stream = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "تو آراما هستی؛ یک همراه همدل فارسی‌زبان.",
        },
        { role: "user", content: "سلام، حالتون چطوره؟" },
      ],
      temperature: 0.7,
      max_tokens: 200,
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
    console.error("\nError calling Gemini API:", error.message);
  }
}

test();
