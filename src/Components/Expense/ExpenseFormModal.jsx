


import React from "react";
import { IoIosClose } from "react-icons/io";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl p-4 bg-white rounded-lg shadow dark:bg-gray-700">
        {/* Modal header */}
        <div className="flex items-center justify-between px-4">
          <span className="font-semibold text-lavender--600">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200"
          >
            <IoIosClose className="w-5 h-5 text-red-500 border border-red-500 rounded-full" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 md:p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
