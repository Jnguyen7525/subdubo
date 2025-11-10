import React from "react";

function Logo() {
  return (
    // face
    <div className="border-2 border-yellow-200 shadow-lg bg-yellow-100 w-16 h-16 rounded-full relative">
      {/* left eye */}
      <div className="w-3 h-1 border-2 border-black bg-black rotate-10 absolute top-4 -left-1" />
      <div className="w-5 h-5 border-black border-2 bg-white rounded-full absolute top-3 left-2 pt-1">
        <div className="w-4 h-4 border-t-black border-transparent border-2 rounded-t-full " />
      </div>
      <div className="absolute left-[26px] top-1 text-xl font-bold">-</div>
      {/* right eye */}
      <div className="w-3 h-1 border-2 border-black bg-black rotate-[-10deg] absolute top-4 -right-1" />
      <div className="w-5 h-5 border-black border-2 bg-white rounded-full absolute top-3 right-2 pt-1">
        <div className="w-4 h-4 border-t-black border-transparent border-2 rounded-t-full " />
      </div>
      {/* mouth */}
      <div className="w-6 h-4 border-black bg-red-300 border-2 rounded-b-full absolute bottom-3 left-[18px]" />
    </div>
  );
}

export default Logo;
