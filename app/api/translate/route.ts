import { NextRequest } from "next/server";
import { Client } from "@gradio/client";

const SPACE_ID = process.env.SPACE_ID;
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
    const client = await Client.connect(SPACE_ID!);

    const result = await client.predict("/predict", {
      text,
      target_language_code: targetLanguage,
    });

    const translatedText = (result.data as string[])[0] || "";

    return new Response(JSON.stringify({ translatedText }), { status: 200 });
  } catch (error) {
    console.error("❌ Translation failed:", error);
    return new Response(JSON.stringify({ error: "Translation failed" }), {
      status: 500,
    });
  }
}
