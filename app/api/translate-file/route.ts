import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { extname } from "path";
import os from "os";
import { Client } from "@gradio/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("📥 [START] File upload received");

  try {
    const formData: FormData = await req.formData();
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extname(file.name).replace(".", "").toLowerCase();
    let extractedText = "";

    // Temp file path
    const tempDir = os.tmpdir();
    await fs.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/upload-${uuidv4()}-${file.name}`;
    await fs.writeFile(tempPath, buffer);

    if (ext === "pdf") {
      console.log("📕 Extracting text from PDF with pdf2json...");

      const pdfParser = new (PDFParser as any)(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: any) =>
        console.error("❌ PDF parsing error:", errData.parserError)
      );

      const pdfText: string = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", () => {
          resolve(pdfParser.getRawTextContent() || "");
        });
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.loadPDF(tempPath);
      });

      extractedText = pdfText;
      console.log(`📝 Extracted ${extractedText.length} characters from PDF`);
    } else if (ext === "docx") {
      console.log("📘 Extracting text from DOCX...");
      const result = await mammoth.extractRawText({ path: tempPath });
      extractedText = result.value;
      console.log(`📝 Extracted ${extractedText.length} characters from DOCX`);
    } else if (ext === "txt" || ext === "md") {
      console.log("📜 Reading plain text file...");
      extractedText = buffer.toString("utf-8");
      console.log(`📝 Extracted ${extractedText.length} characters from text`);
    } else {
      console.error(`⚠ Unsupported file type: ${ext}`);
      return new NextResponse(
        JSON.stringify({ error: "Unsupported file type" }),
        { status: 400 }
      );
    }

    // Send to Gradio translation model
    console.log("🚀 Sending to translation model...");
    const client = await Client.connect("jnguyen2575/small-100-translate");
    const result = await client.predict("/predict", {
      text: extractedText,
      target_language_code: targetLanguage,
    });

    const translatedText = Array.isArray(result.data)
      ? String(result.data[0])
      : "";
    console.log("✅ Translation complete");

    // Cleanup temp file
    await fs.unlink(tempPath);
    console.log("🧹 Cleaned up temp file");

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
