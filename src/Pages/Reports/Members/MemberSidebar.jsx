import React from "react";

const items = [
  "Birthday",
  "Marriage",

];

export const MemberSidebar = ({ active, setActive }) => {
  return (
    <div className="bg-white w-30 border-r">
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            onClick={() => setActive(index)}
            className={`p-4 cursor-pointer text-[15px]
            ${
              active === index
                ? "bg-gray-100 text-lavender--600"
                : "hover:bg-gray-100"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};