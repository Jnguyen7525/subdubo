import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, targetLanguage } = body;

  if (!text || !targetLanguage) {
    console.warn("⚠️ Missing text or target language");
    return new Response(
      JSON.stringify({ error: "Missing text or target language" }),
      { status: 400 }
    );
  }

  try {
    // Call your FastAPI backend instead of Hugging Face
    const response = await fetch(
      // process.env.SMALL100_API_URL || "http://localhost:9090/translate",
      "http://98.92.146.63:9090/translate",

      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          target_language_code: targetLanguage, // must match FastAPI schema
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || "";

    return new Response(JSON.stringify({ translatedText }), { status: 200 });
  } catch (error) {
    console.error("❌ Translation failed:", error);
    return new Response(JSON.stringify({ error: "Translation failed" }), {
      status: 500,
    });
  }
}
