import { useState } from "react";
import { account } from "../lib/appwrite";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!email) return;

    try {
      await account.createMagicURLToken(
        "unique()", // user id
        email,
        window.location.origin + "/dashboard"
      );

      setMessage("✅ Check your email for login link");
    } catch (err) {
      setMessage("❌ Failed to send email");
      console.error(err);
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>Continue with Email</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, width: 250 }}
      />

      <br /><br />

      <button onClick={handleLogin} style={{ padding: 10 }}>
        Send Login Link
      </button>

      <p>{message}</p>
    </div>
  );
}