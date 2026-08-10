import { useAuth} from "@clerk/expo";
import { Redirect, Slot} from "expo-router";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded} = useAuth()

  //sync  clerk user  tto superbase(will build later)
  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/sign-in"/>

  return <Slot/>
}