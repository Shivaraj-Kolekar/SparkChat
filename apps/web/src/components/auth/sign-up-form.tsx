import { useSignIn } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCallback } from "react";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const { signIn, isLoaded } = useSignIn();

  const handleOAuth = useCallback(
    (provider: "google" | "github") => async () => {
      if (!isLoaded) return;
      await signIn?.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    },
    [signIn, isLoaded]
  );

  return (
    <div>
      <Button className="w-full mb-2" onClick={handleOAuth("google")}>Sign up with Google</Button>
      <Button className="w-full" onClick={handleOAuth("github")}>Sign up with GitHub</Button>
      <button onClick={onSwitchToSignIn}>Already have an account? Sign in</button>
    </div>
  );
}
