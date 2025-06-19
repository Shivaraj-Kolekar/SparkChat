import { SignIn, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Loader from "./loader";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  // Clerk handles sign-in UI and logic
  return (
    <div>
      <SignIn afterSignInUrl="/" signUpUrl="/login" />
      <button onClick={onSwitchToSignUp}>Don't have an account? Sign up</button>
    </div>
  );
}
