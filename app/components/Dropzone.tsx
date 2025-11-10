import React, { useState } from "react";
import { useDropzone, FileWithPath, FileError } from "react-dropzone";

interface DropzoneProps {
  open?: React.MouseEventHandler<HTMLButtonElement>;
  targetLanguage: string;
  setTranslatedText: (text: string) => void;
}

export default function Dropzone({
  open,
  targetLanguage,
  setTranslatedText,
}: DropzoneProps) {
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    maxFiles: 1,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  const handleUploadClick = async () => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    setTranslated("");
    setDownloadUrl(null);

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLanguage", targetLanguage);

    try {
      const res = await fetch("/api/translate-file", {
        method: "POST",
        body: formData,
      });

      const { translatedText } = await res.json();
      setTranslated(translatedText);
      setTranslatedText(translatedText);

      // Create a downloadable .txt file blob
      const blob = new Blob([translatedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      console.log("✅ Translation complete:", translatedText);
    } catch (err) {
      console.error("❌ Translation failed:", err);
      alert("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fileList = acceptedFiles.map((file: FileWithPath) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

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
                  ? "Release to drop the file"
                  : "Drag your document here"}
              </p>
              <button
                type="button"
                onClick={open}
                className="p-2 rounded-xl bg-[#121435] hover:scale-105 cursor-pointer hover:bg-[#ff5722] transition-colors duration-200 ease-in-out text-[#faf9f0]"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#ff5722] rounded-md w-fit h-full p-1 rotate-2 -translate-x-5">
          <div className="w-fit h-full bg-[#121435] text-white tracking-wider text-center flex flex-col items-center justify-evenly -rotate-3 border-2 rounded-md p-1 text-sm sm:text-base flex-wrap space-x-1">
            <span>파일</span>
            <span>文件</span>
            <span>ファイル</span>
            <span>tập tin</span>
          </div>
        </div>
      </div>

      {/* File info + translate button */}
      <div className="flex space-x-2">
        <div className="bg-[#ff5722] rounded-md w-fit h-full p-1 rotate-2">
          <div className="w-fit h-full bg-[#121435] text-white tracking-wider text-center flex flex-col items-center justify-evenly -rotate-2 border-2 rounded-md p-2 text-sm sm:text-base overflow-x-scroll scrollbar-hide min-w-[200px]">
            {fileList.length > 0 ? (
              <ul>{fileList}</ul>
            ) : (
              <div>please pick a file</div>
            )}
          </div>
        </div>

        {rejectionList.length > 0 ? (
          <div className="p-1 border-2 border-[#121435] rounded-xl bg-red-600 hover:scale-105 flex items-center text-white">
            <ul>{rejectionList}</ul>
          </div>
        ) : (
          <button
            disabled={fileList.length === 0 || loading}
            onClick={handleUploadClick}
            className="w-fit p-2 rounded-xl bg-[#121435] border-2 border-[#121435] hover:scale-105 cursor-pointer hover:bg-[#ff5722] transition-colors duration-200 ease-in-out text-white disabled:bg-[#faf9f0] disabled:text-[#121435] disabled:cursor-default disabled:hover:scale-100"
          >
            {loading ? "Translating..." : "Translate File"}
          </button>
        )}
      </div>

      {/* Translated text preview */}
      {translated && (
        <div className="flex flex-col items-center space-y-2 mt-4 w-full max-w-2xl">
          <h3 className="text-[#121435] font-semibold text-lg">
            Translated Text
          </h3>
          <div className="bg-[#faf9f0] border border-[#121435] rounded-md p-4 text-sm text-[#121435] whitespace-pre-wrap w-full max-h-64 overflow-y-auto scrollbar-hide">
            {translated}
          </div>

          {downloadUrl && (
            <a
              href={downloadUrl}
              download="translated.txt"
              className="mt-2 px-3 py-1 bg-[#121435] text-white rounded-md hover:bg-[#ff5722] transition"
            >
              Download Translation
            </a>
          )}
        </div>
      )}
    </div>
  );
}
