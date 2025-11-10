// FileTranslateView.tsx
// Displays file upload interface for translation

import Dropzone from "./Dropzone";

interface FileTranslateViewProps {
  targetLanguage: string;
  setTranslatedText: (text: string) => void;
}

const FileTranslateView = ({
  targetLanguage,
  setTranslatedText,
}: FileTranslateViewProps) => (
  <div className="w-full h-[300px]">
    <Dropzone
      targetLanguage={targetLanguage}
      setTranslatedText={setTranslatedText}
    />
  </div>
);

export default FileTranslateView;
