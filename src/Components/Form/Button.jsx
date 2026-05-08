// import React from "react";

// const Button = ({
//   saving = false,
//   type = "save",      // save | update
//   onClick,
//   className = "",
//   buttonType = "submit"
// }) => {

//   const labelMap = {
//     save: "Save",
//     update: "Update"
//   };

//   const savingMap = {
//     save: "Saving...",
//     update: "Updating..."
//   };

//   return (
//     <button
//       type={buttonType}
//       onClick={onClick}
//       disabled={saving}
//       className={`px-4 py-2 text-white rounded-md flex items-center gap-2
//       ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
//       ${className}`}
//     >
//       {saving && (
//         <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
//       )}

//       {saving ? savingMap[type] : labelMap[type]}
//     </button>
//   );
// };

// export default Button;



import React from "react";

const Button = ({
  saving = false,
  type = "save", // save | update
  label,         // ✅ custom label
  savingLabel,   // ✅ custom saving label
  onClick,
  className = "",
  buttonType = "submit"
}) => {

  const labelMap = {
    save: "Save",
    update: "Update"
  };

  const savingMap = {
    save: "Saving...",
    update: "Updating..."
  };

  return (
    <button
      type={buttonType}
      onClick={onClick}
      disabled={saving}
      className={`px-4 py-2 text-white rounded-md flex items-center justify-center gap-2
      ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
      ${className}`}
    >
      {saving && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}

      {saving
        ? (savingLabel || savingMap[type])
        : (label || labelMap[type])}
    </button>
  );
};

export default Button;