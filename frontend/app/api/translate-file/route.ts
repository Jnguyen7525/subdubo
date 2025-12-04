import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("📥 [START] File upload received");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetLanguage = (formData.get("targetLanguage") as string) || "";

    if (!file || !targetLanguage) {
      console.error("❌ Missing file or target language");
      return new NextResponse(
        JSON.stringify({ error: "Missing file or target language" }),
        { status: 400 }
      );
    }

    console.log(
      `📄 File name: ${file.name}, size: ${file.size}, type: ${file.type}`
    );
    console.log(`🌐 Target language: ${targetLanguage}`);

    // Build form data to send to FastAPI
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("target_language_code", targetLanguage);

    // Call FastAPI backend instead of Hugging Face
    const response = await fetch(
      // process.env.SMALL100_API_URL || "http://localhost:9090/translate-file",
      "http://44.222.231.176:9090/translate-file",

      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || "";

    console.log("✅ Translation complete");
    return new NextResponse(JSON.stringify({ translatedText }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error in translate-file route:", err);
    return new NextResponse(JSON.stringify({ error: "Translation failed" }), {
      status: 500,
    });
  }
}
