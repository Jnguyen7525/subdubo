from fastapi import FastAPI, UploadFile, Form
from pydantic import BaseModel
from transformers import M2M100ForConditionalGeneration
from tokenization_small100 import SMALL100Tokenizer  # must be available in your project
import os
import uuid
import tempfile
import mammoth
from pdfminer.high_level import extract_text as extract_pdf_text



# Load model + tokenizer
MODEL_ID = "alirezamsh/small100"
print(f"🔧 Loading model: {MODEL_ID}")

tokenizer = SMALL100Tokenizer.from_pretrained(MODEL_ID)
model = M2M100ForConditionalGeneration.from_pretrained(MODEL_ID)

print("✅ Model and tokenizer loaded successfully")

# FastAPI app
app = FastAPI()

# Request schema
class TranslationRequest(BaseModel):
    text: str
    target_language_code: str  # e.g. "fr", "en", "zh"

@app.post("/translate")
def translate(req: TranslationRequest):
    text = req.text
    target_lang = req.target_language_code

    if not text or not target_lang:
        return {"error": "Missing input or target language"}

    try:
        # Set target language
        tokenizer.tgt_lang = target_lang

        # Encode input
        inputs = tokenizer(text, return_tensors="pt")

        # Generate translation with beam search + max length
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.get_lang_id(target_lang),
            max_length=256,
            num_beams=5
        )

        # Decode output
        translated = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
        return {"translatedText": translated}

    except Exception as e:
        return {"error": f"Translation failed: {str(e)}"}
    
@app.post("/translate-file")
async def translate_file(file: UploadFile, target_language_code: str = Form(...)):
    print("📥 [START] File upload received")

    try:
        # Save temp file
        suffix = os.path.splitext(file.filename)[1].lower()
        temp_path = os.path.join(tempfile.gettempdir(), f"upload-{uuid.uuid4()}{suffix}")
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        print(f"📄 File name: {file.filename}, size: {file.size}, type: {file.content_type}")
        print(f"🌐 Target language: {target_language_code}")

        extracted_text = ""

        # Handle file types
        if suffix == ".pdf":
            print("📕 Extracting text from PDF...")
            extracted_text = extract_pdf_text(temp_path)
            print(f"📝 Extracted {len(extracted_text)} characters from PDF")
        elif suffix == ".docx":
            print("📘 Extracting text from DOCX...")
            result = await mammoth.extract_raw_text({"path": temp_path})
            extracted_text = result.value
            print(f"📝 Extracted {len(extracted_text)} characters from DOCX")
        elif suffix in [".txt", ".md"]:
            print("📜 Reading plain text file...")
            with open(temp_path, "r", encoding="utf-8") as f:
                extracted_text = f.read()
            print(f"📝 Extracted {len(extracted_text)} characters from text file")
        else:
            print(f"⚠ Unsupported file type: {suffix}")
            return {"error": f"Unsupported file type: {suffix}"}

        # Cleanup temp file
        os.remove(temp_path)
        print("🧹 Cleaned up temp file")

        if not extracted_text.strip():
            return {"error": "No text extracted from file"}

        # Translate extracted text
        print("🚀 Sending to translation model...")
        tokenizer.tgt_lang = target_language_code
        inputs = tokenizer(extracted_text, return_tensors="pt")
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.get_lang_id(target_language_code),
            max_length=256,
            num_beams=5
        )
        translated = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
        print("✅ Translation complete")

        return {"translatedText": translated}

    except Exception as e:
        print(f"❌ Error in translate-file route: {e}")
        return {"error": f"Translation failed: {str(e)}"}
