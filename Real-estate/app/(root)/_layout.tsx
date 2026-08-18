import { useUserSync } from "@/hooks/useUserAsync";
import { useAuth} from "@clerk/expo";
import { Redirect, Slot} from "expo-router";

export default function RootLayout() {
  const { isSignedIn, isLoaded} = useAuth()

  //sync  clerk user  to supabase
  useUserSync();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />
  }

  return <Slot/>
}