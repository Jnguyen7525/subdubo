// LanguageDropdown.tsx
// Reusable dropdown for selecting source or target language

import { ChevronDown } from "lucide-react";
import { languageArray } from "@/languageList";

interface Props {
  label: string;
  selected: string;
  show: boolean;
  toggle: () => void;
  onSelect: (lang: string) => void;
}

const LanguageDropdown = ({
  label,
  selected,
  show,
  toggle,
  onSelect,
}: Props) => (
  <div className="w-full flex gap-1">
    <span>{label}</span>
    <span
      className="hover:text-[#ff5722] cursor-pointer transition-colors duration-200 ease-in-out"
      onClick={toggle}
    >
      {selected}
    </span>
    <ChevronDown
      className={`text-[#ff5722] text-xl transform transition-transform duration-200 ease-in-out ${
        show ? "rotate-180" : "rotate-0"
      }`}
    />

    {show && (
      <div className="absolute z-10 top-8 left-0 flex w-full h-[500px] sm:h-[720px] bg-[#121435] rounded-lg p-1 text-[#faf9f0]  border-[#faf9f0] border-2 ">
        <div className="bg-[#faf9f0] flex flex-col w-full h-full rounded-lg overflow-y-auto scrollbar-hide p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 w-full">
            {languageArray.map(([name]) => (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className="cursor-pointer text-[#121435] hover:text-[#ff5722] transition-colors duration-200 ease-in-out"
              >
                {name.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default LanguageDropdown;
