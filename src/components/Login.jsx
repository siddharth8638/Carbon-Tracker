import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="login-screen">
      <h1>Carbon Tracker</h1>
      <p>Understand. Track. Reduce. With insights tailored to your habits.</p>
      <button onClick={login} className="google-btn">
        Sign in with Google
      </button>
    </div>
  );
}
