import React, { useEffect, useState } from "react";
import Spinners from "../Spinners";

import { FaUsers, FaPeopleRoof } from "react-icons/fa6";

function MembersSummaryCard({
  subscribed,
  total,
  loading,
}) {
  const [subscribedDisplay, setSubscribedDisplay] = useState(0);
  const [totalDisplay, setTotalDisplay] = useState(0);

  const animate = (end, setter) => {
    let start = 0;
    if (end === 0) {
      setter(0);
      return;
    }

    const duration = 1500;
    const interval = 20;
    const step = Math.ceil(end / (duration / interval));

    const counter = setInterval(() => {
      start += step;
      if (start >= end) {
        setter(end);
        clearInterval(counter);
      } else {
        setter(start);
      }
    }, interval);

    return () => clearInterval(counter);
  };

  useEffect(() => {
    if (loading) {
      setSubscribedDisplay(0);
      setTotalDisplay(0);
      return;
    }

    const clear1 = animate(subscribed, setSubscribedDisplay);
    const clear2 = animate(total, setTotalDisplay);

    return () => {
      clear1 && clear1();
      clear2 && clear2();
    };
  }, [subscribed, total, loading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Members
        </h2>
        <FaUsers size={36} className="text-lavender--600"/>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        {loading ? (
          <Spinners />
        ) : (
          <>
            <div className="text-5xl font-bold text-lavender--600">
              {totalDisplay}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              Total Members
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default MembersSummaryCard;
