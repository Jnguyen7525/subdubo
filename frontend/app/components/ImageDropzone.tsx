import React, { useState, useEffect, useRef } from "react";
import { useDropzone, FileError } from "react-dropzone";
import { createWorker } from "tesseract.js";

interface ImageDropzoneProps {
  open?: React.MouseEventHandler<HTMLButtonElement>;
  targetLanguage: string;
  translatedText: string;
  setTranslatedText: (text: string) => void;
}

export default function ImageDropzone({
  open,
  targetLanguage,
  translatedText,
  setTranslatedText,
}: ImageDropzoneProps) {
  const [extracted, setExtracted] = useState("");
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgDims, setImgDims] = useState({
    naturalWidth: 1,
    naturalHeight: 1,
    displayWidth: 1,
    displayHeight: 1,
  });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    maxFiles: 1,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
  });

  // Generate preview URL once per file
  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const url = URL.createObjectURL(acceptedFiles[0]);
      setPreviewUrl(url);
      setTranslatedText("");
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [acceptedFiles]);

  // Run OCR automatically when a file is selected
  useEffect(() => {
    const runOCR = async (file: File) => {
      const worker = await createWorker("eng", 1, {
        logger: (m: any) => console.log("🔎 Tesseract log:", m),
      });

      try {
        const { data } = await worker.recognize(
          file,
          {},
          { blocks: true, tsv: true, hocr: true }
        );
        console.log("📊 Worker OCR data:", data);
        const rawText = data.text || "";

        // 1. Trim leading/trailing whitespace
        let text = rawText.trim().replace(/\n+/g, " ");

        setExtracted(text);
        console.log("📝 Extracted text:", text);

        // Traverse blocks → paragraphs → lines → words
        let combinedBox: any = null;
        if (data.blocks) {
          const allWords: any[] = [];
          data.blocks.forEach((block: any) => {
            block.paragraphs.forEach((par: any) => {
              par.lines.forEach((line: any) => {
                line.words.forEach((word: any) => {
                  allWords.push(word);
                });
              });
            });
          });

          if (allWords.length > 0) {
            const x0 = Math.min(...allWords.map((w) => w.bbox.x0));
            const y0 = Math.min(...allWords.map((w) => w.bbox.y0));
            const x1 = Math.max(...allWords.map((w) => w.bbox.x1));
            const y1 = Math.max(...allWords.map((w) => w.bbox.y1));

            combinedBox = {
              text: allWords.map((w) => w.text).join(" "),
              bbox: { x0, y0, x1, y1 },
              confidence: Math.min(...allWords.map((w) => w.confidence)),
            };
          }
        }

        setBoxes(combinedBox ? [combinedBox] : []);
        console.log("📦 Combined box:", combinedBox);
      } catch (err) {
        console.error("❌ OCR failed:", err);
        setExtracted("");
        setBoxes([]);
      } finally {
        await worker.terminate();
        setLoading(false);
      }
    };

    if (acceptedFiles.length > 0) {
      setLoading(true);
      runOCR(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  // Translation happens only when button is clicked
  const handleTranslateClick = async () => {
    if (!extracted) {
      alert("No text detected to translate.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted, targetLanguage }),
      });
      const data = await response.json();
      setTranslatedText(data.translatedText);
      console.log(`🌐 translatedText: ${data.translatedText}`);
    } catch (error) {
      setTranslatedText("Translation error");
    } finally {
      setLoading(false);
    }
  };

  const rejectionList = fileRejections.flatMap((rejection) =>
    rejection.errors.map((e: FileError) => (
      <li key={e.code}>
        {e.code === "too-many-files"
          ? "Please select only 1 file!"
          : e.code === "file-invalid-type"
          ? "Unsupported file type!"
          : e.message}
      </li>
    ))
  );

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Upload Box */}
      <div className="flex w-full h-full">
        <div className="w-full flex flex-col rounded-md p-[1.5px] text-[#121435] bg-[#faf9f0] relative">
          <div
            {...getRootProps({
              className:
                "bg-[#faf9f0] border-2 border-[#121435] p-5 rounded-md flex flex-col space-y-2 items-center text-center",
            })}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col space-y-2 sm:space-y-5 items-center">
              <p>
                {isDragActive
                  ? "Release to drop the image"
                  : "Drag your image here"}
              </p>
              <button
                type="button"
                onClick={open}
                className="p-2 rounded-xl bg-[#121435] hover:scale-105 cursor-pointer hover:bg-[#ff5722] transition-colors duration-200 ease-in-out text-[#faf9f0]"
              >
                Browse Images
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#ff5722] rounded-md w-fit h-full p-1 rotate-2 -translate-x-5">
          <div className="w-fit h-full bg-[#121435] text-white tracking-wider text-center flex flex-col items-center justify-evenly -rotate-3 border-2 rounded-md p-1 text-sm sm:text-base flex-wrap space-x-1">
            <span>이미지</span>
            <span>图片</span>
            <span>画像</span>
            <span>hình ảnh</span>
          </div>
        </div>
      </div>

      {/* File info + translate button */}
      <div className="flex space-x-2 items-center">
        <div className="bg-[#ff5722] rounded-md w-fit h-full p-1 rotate-2">
          <div className="w-fit h-full bg-[#121435] text-white text-center flex flex-col items-center justify-evenly -rotate-2 border-2 rounded-md p-2 text-sm sm:text-base min-w-[200px]">
            {previewUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative inline-block">
                  {/* Image preview */}
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="preview"
                    className="max-h-64 object-contain rounded-md border border-[#ff5722]"
                    onLoad={(e) =>
                      setImgDims({
                        naturalWidth: e.currentTarget.naturalWidth,
                        naturalHeight: e.currentTarget.naturalHeight,
                        displayWidth: e.currentTarget.width,
                        displayHeight: e.currentTarget.height,
                      })
                    }
                  />
                </div>
                <span className="text-xs mt-2 text-[#faf9f0] block">
                  {extracted
                    ? `Extracted Text: ${extracted}`
                    : "No text detected"}
                </span>
                <span className="text-xs mt-2 text-[#faf9f0] block">
                  {translatedText && `Translated Text: ${translatedText}`}
                </span>
              </div>
            ) : (
              <div>please pick an image</div>
            )}
          </div>
        </div>

        {rejectionList.length > 0 ? (
          <div className="p-1 border-2 border-[#121435] rounded-xl bg-red-600 flex items-center text-white">
            <ul>{rejectionList}</ul>
          </div>
        ) : (
          <button
            disabled={!extracted || loading}
            onClick={handleTranslateClick}
            className="w-fit p-2 rounded-xl bg-[#121435] border-2 border-[#121435] hover:scale-105 cursor-pointer hover:bg-[#ff5722] transition-colors duration-200 ease-in-out text-white disabled:bg-[#faf9f0] disabled:text-[#121435] disabled:cursor-default disabled:hover:scale-100 h-fit"
          >
            {loading ? "Processing..." : "Translate"}
          </button>
        )}
      </div>
    </div>
  );
}
