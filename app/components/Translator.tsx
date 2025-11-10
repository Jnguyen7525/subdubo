"use client";

import { useState } from "react";
import TextTranslateView from "./TextTranslateView";
import FileTranslateView from "./FileTranslateView";
import LanguageDropdown from "./LanguageDropdown";
import { small100Languages } from "@/languageList";

function Translator() {
  // Language selection state
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Korean");
  const [showSourceLanguages, setShowSourceLanguages] = useState(false);
  const [showTargetLanguages, setShowTargetLanguages] = useState(false);

  // Tab state: 0 = text, 1 = file
  const [tab, setTab] = useState(0);

  // Translation state
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translatedFile, setTranslatedFile] = useState("");

  // Tab switching handlers
  const textTab = () => setTab(0);
  const fileTab = () => setTab(1);

  // Dropdown toggles
  const chooseSourceLanguage = () => {
    setShowSourceLanguages(!showSourceLanguages);
    setShowTargetLanguages(false);
  };
  const chooseTargetLanguage = () => {
    setShowTargetLanguages(!showTargetLanguages);
    setShowSourceLanguages(false);
  };

  return (
    <div className="bg-white w-full flex flex-col space-y-5">
      <div className="flex flex-col space-y-2 px-4 sm:px-28 w-full font-medium text-[#121435]">
        {/* Language selection and tab controls */}
        <div className="flex w-full relative z-20 items-center justify-between">
          <div className="flex items-center gap-1">
            <LanguageDropdown
              label={"From:"}
              selected={sourceLanguage}
              show={showSourceLanguages}
              toggle={chooseSourceLanguage}
              onSelect={setSourceLanguage}
            />
            <LanguageDropdown
              label="To:"
              selected={targetLanguage}
              show={showTargetLanguages}
              toggle={chooseTargetLanguage}
              onSelect={setTargetLanguage}
            />
          </div>
          <div className="relative flex gap-3">
            <button
              onClick={textTab}
              className="relative px-1 rounded-xl cursor-pointer text-[#121435] hover:text-[#ff5722] transition-colors duration-200 ease-in-out"
            >
              Text
            </button>
            <button
              onClick={fileTab}
              className="relative px-1 rounded-xl cursor-pointer text-[#121435] hover:text-[#ff5722] transition-colors duration-200 ease-in-out"
            >
              File
            </button>

            {/* Animated underline */}
            <div
              className={`absolute bottom-0 h-0.5 bg-[#ff5722] transition-all duration-200 ease-in-out`}
              style={{
                width: "40px",
                transform: `translateX(${tab === 0 ? "0px" : "45px"})`,
              }}
            />
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full h-fit">
          {tab === 0 ? (
            <TextTranslateView
              inputText={inputText}
              setInputText={setInputText}
              translatedText={translatedText}
              setTranslatedText={setTranslatedText}
              targetLanguage={targetLanguage}
              languageDictionary={small100Languages}
            />
          ) : (
            <FileTranslateView
              targetLanguage={small100Languages[targetLanguage]}
              setTranslatedText={setTranslatedFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Translator;
