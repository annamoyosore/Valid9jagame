import { useState, useEffect } from "react";
import { account, ID } from "../lib/appwrite";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  async function handleLogin() {
    if (!email) return setMessage("❌ Enter email");

    setLoading(true);
    setMessage("");

    try {
      await account.createMagicURLToken(
        ID.unique(),
        email,
        window.location.origin + "/dashboard"
      );

      setMessage("✅ Check your email for login link");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>Login to Play</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, width: 250 }}
      />

      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Sending..." : "Send Login Link"}
      </button>

      <p>{message}</p>
    </div>
  );
}