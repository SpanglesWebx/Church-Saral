// import React from "react";

// const CharCounter = ({ value = "", max = 100, show }) => {

//   if (!show || !value.length) return null;

//   return (
//     <span
//       className={`absolute bottom-1 right-2 text-[10px]
//       ${value.length > max ? "text-red-500" : "text-gray-400"}`}
//     >
//       {value.length}/{max}
//     </span>
//   );
// };

// export default CharCounter;



import React from "react";

const CharCounter = ({ value, max = 100, show }) => {

  const safeValue = value || ""; // 🔥 handle null / undefined

  if (!show || safeValue.length === 0) return null;

  return (
    <span
      className={`absolute bottom-1 right-2 text-[10px]
      ${safeValue.length > max ? "text-red-500" : "text-gray-400"}`}
    >
      {safeValue.length}/{max}
    </span>
  );
};

export default CharCounter;