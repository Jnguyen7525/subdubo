// TextTranslateView.tsx
// Handles text input, translation, and output display

import { useEffect, useState } from "react";

interface Props {
  inputText: string;
  setInputText: (text: string) => void;
  translatedText: string;
  setTranslatedText: (text: string) => void;
  targetLanguage: string;
  languageDictionary: Record<string, string>;
}

const TextTranslateView = ({
  inputText,
  setInputText,
  translatedText,
  setTranslatedText,
  targetLanguage,
  languageDictionary,
}: Props) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const [loading, setLoading] = useState(false);

  const handleTranslation = async (value: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: value,
          targetLanguage: languageDictionary[targetLanguage],
        }),
        signal,
      });
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      setTranslatedText("Translation error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputText.trim()) handleTranslation(inputText);
    }, 1000);
    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [inputText, targetLanguage]);

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={(e) => e.preventDefault()} className="w-full relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Please type something to translate..."
          className="w-full h-[200px] sm:h-[300px] resize-none bg-[#faf9f0] border-2 border-[#121435] p-2 rounded-md"
        />
        <button
          type="submit"
          className="absolute -bottom-2 -right-2 bg-[#121435] text-white p-2 rounded-md cursor-pointer hover:bg-[#ff5722] transition-colors duration-200 ease-in-out"
        >
          Translate
        </button>
      </form>

      <div className="bg-[#ff5722] rounded-md  w-full h-fit p-[.5px]">
        <div className="w-full h-fit bg-[#121435] text-white tracking-wider flex justify-evenly rotate-2 sm:rotate-1 border-2 rounded-md p-[.5px] text-sm sm:text-base flex-wrap space-x-1">
          <span>안녕하세요</span>
          <span>你好</span>
          <span>こんにちは</span>
          <span>xin chào</span>
          <span>hola</span>
          <span>bonjour</span>
          <span>ciao</span>
          <span>olá</span>
        </div>
      </div>

      <div className="mt-4 bg-[#121435] text-white w-full h-[200px] sm:h-[300px] rounded-md p-2 relative">
        {loading ? "Translating..." : translatedText || "Translation"}
      </div>
    </div>
  );
};

export default TextTranslateView;
