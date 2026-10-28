import { useAuth } from "@clerk/expo";
import { useSupabase } from "./useSupabase";
import { useCallback, useEffect, useState } from "react";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const checkIfSaved = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await authSupabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyId)
      // No matching row simply means this property has not been saved yet.
      .maybeSingle();

    if (error) {
      console.error("Error checking saved property:", error);
      return;
    }

    setIsSaved(!!data);
  }, [authSupabase, propertyId, userId]);

  useEffect(() => {
    checkIfSaved();
  }, [checkIfSaved]);

  const toggleSave = async () => {
    if (!userId || saveLoading) return;
    setSaveLoading(true);

    try {
      if (isSaved) {
        const { error } = await authSupabase
          .from("saved_properties")
          .delete()
          .eq("user_clerk_id", userId)
          .eq("property_id", propertyId);

        if (error) throw error;
        setIsSaved(false);
        onUnsave?.();
      } else {
        const { error } = await authSupabase.from('saved_properties').insert({
          user_clerk_id: userId,
          property_id: propertyId,
        });

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error updating saved property:", error);
    } finally {
      setSaveLoading(false);
    }
  };
  return { isSaved, toggleSave, saveLoading };
}
