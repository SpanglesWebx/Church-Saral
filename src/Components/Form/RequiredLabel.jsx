import React from "react";

const RequiredLabel = ({ children }) => {
  return (
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-600 ml-1">*</span>
    </label>
  );
};

export default RequiredLabel;