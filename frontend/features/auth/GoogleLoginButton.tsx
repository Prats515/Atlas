/**
 * A reusable component that navigates the user to the backend Google OAuth login flow.
 */

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function GoogleLoginButton() {
  return (
    <a
      href={`${backendUrl}/auth/google/login`}
      className="login-button"
      style={{
        display: "inline-block",
        padding: "12px 24px",
        backgroundColor: "#4285f4",
        color: "white",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "600",
      }}
    >
      Sign in with Google
    </a>
  );
}
