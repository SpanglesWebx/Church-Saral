


import React, { useEffect } from "react";
import { IoIosClose } from "react-icons/io";

const DetailModal = ({ isOpen, onClose, title, children, loading = false }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading && e.key === "Escape") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 shadow-md"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="relative w-1/4 max-w-sm md:max-w-2xl lg:max-w-4xl p-4 bg-white rounded-lg shadow dark:bg-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-lavender--600 flex items-center gap-2">
            {loading && (
              <span className="w-4 h-4 border-2 border-lavender--600 border-t-transparent rounded-full animate-spin"></span>
            )}
            {title}
          </h2>

          <button
            type="button"
            disabled={loading}
            onClick={!loading ? onClose : undefined}
            className={`text-gray-400 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center
      ${loading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200 hover:text-gray-900"}
    `}
          >
            <IoIosClose className="w-5 h-5 border rounded-full text-red-700 border-red-700" />
          </button>
        </div>

        {/* Modal body */}
        <div
          className={`p-4 md:p-5 space-y-4 max-h-[80vh] overflow-y-auto
            ${loading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;