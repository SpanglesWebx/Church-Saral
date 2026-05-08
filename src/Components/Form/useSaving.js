import { useState } from "react";

export const useSaving = () => {

  const [saving, setSaving] = useState(false);

  const startSaving = () => setSaving(true);
  const stopSaving = () => setSaving(false);

  return {
    saving,
    startSaving,
    stopSaving
  };
};