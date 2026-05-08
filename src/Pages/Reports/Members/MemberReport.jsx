import React, { useState } from "react";
import { MemberSidebar } from "./MemberSidebar";
import BirthdayReport from "./BirthdayReport";
import MarriageReport from "./MarriageReport";

export const MemberReport = () => {
  const [active, setActive] = useState(0);

  return (
    <div className="p-0 bg-gray-50 min-h-screen">

     

        {/* Heading */}
        {/* <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-lavender--600 text-center">
            Member Reports
          </h1>
        </div> */}

        {/* Body */}
        <div className="flex">

          {/* Sidebar */}
          <MemberSidebar active={active} setActive={setActive} />

          {/* Content */}
          <div className="flex-1 p-6">
            {active === 0 && <BirthdayReport />}
            {active === 1 && <MarriageReport />}
          </div>

        </div>

     

    </div>
  );
};