// ImageTranslateView.tsx
// Displays Image upload interface for translation

import ImageDropzone from "./ImageDropzone";

interface ImageTranslateViewProps {
  targetLanguage: string;
  translatedText: string;
  setTranslatedText: (text: string) => void;
}

const ImageTranslateView = ({
  targetLanguage,
  translatedText,
  setTranslatedText,
}: ImageTranslateViewProps) => (
  <div className="w-full h-[300px]">
    <ImageDropzone
      targetLanguage={targetLanguage}
      translatedText={translatedText}
      setTranslatedText={setTranslatedText}
    />
  </div>
);

export default ImageTranslateView;
