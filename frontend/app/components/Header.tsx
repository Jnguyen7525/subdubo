"use client";

import { useState } from "react";

function Header() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex w-full items-center justify-between relative ">
      <div className="flex w-full items-center justify-between py-2 px-5 sm:px-10  relative bg-white">
        <div className=" tracking-wider text-[#121435] text-xl underline underline-offset-[6px] font-bold ">
          subdubo
        </div>
      </div>
    </div>
  );
}

export default Header;
