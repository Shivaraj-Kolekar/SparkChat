import { SignUp } from "@clerk/nextjs";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  return (
    <div>
      <SignUp afterSignUpUrl="/" signInUrl="/login" />
      <button onClick={onSwitchToSignIn}>
        Already have an account? Sign in
      </button>
    </div>
  );
}
