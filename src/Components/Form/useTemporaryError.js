import { useState } from "react";

export const useTemporaryError = () => {

  const [errors, setErrors] = useState({});

  const showError = (key, message, duration = 2000) => {
    setErrors(prev => ({
      ...prev,
      [key]: message
    }));

    setTimeout(() => {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, duration);
  };

  return { errors, showError, setErrors };
};