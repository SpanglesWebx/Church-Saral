import { useEffect } from "react";

export const useBlockRefresh = (saving) => {

  useEffect(() => {

    const blockRefresh = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);

    return () => {
      window.removeEventListener("beforeunload", blockRefresh);
    };

  }, [saving]);

};