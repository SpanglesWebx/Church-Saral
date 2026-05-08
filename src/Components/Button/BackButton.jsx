import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { NavigationContext } from "../../Context/NavigationContext";

function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const { allowNavigation } = useContext(NavigationContext);

  const handleBack = () => {
    allowNavigation.current = true; // ✅ allow internal back
    navigate(-1);
  };

  return (
    <button
      onClick={handleBack}
      className={`text-xl text-lavender--600 ${className}`}
    >
      <FaArrowLeft />
    </button>
  );
}

export default BackButton;