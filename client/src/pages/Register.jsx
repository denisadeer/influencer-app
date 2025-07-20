import { useState } from "react";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("influencer");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Kontrola minimální délky hesla
    if (password.length < 6) {
      setMessage("❌ Heslo musí mít alespoň 6 znaků.");
      return;
    }

    const realRole = role === "Podnik" ? "business" : role;

    console.log("🟢 Odesílám na backend:", {
      username,
      email,
      password,
      role: realRole,
    });

    try {
      const response = await fetch("http://localhost:5713/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: realRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Registrace proběhla úspěšně! Zkontroluj e-mail.");
      } else {
        setMessage(`❌ Chyba: ${data.message || "Něco se pokazilo"}`);
      }
    } catch (error) {
      console.error("❌ Chyba při komunikaci:", error);
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Registrace</h2>
      <p>Zaregistrujte se jako influencer nebo podnik.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}
      >
        <label>
          Uživatelské jméno:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          E-mail:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Heslo:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="influencer">Influencer</option>
            <option value="Podnik">Podnik</option>
          </select>
        </label>

        <label style={{ marginTop: "1rem" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />{" "}
          Souhlasím s{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            obchodními podmínkami
          </a>
        </label>

        <button
          type="submit"
          style={{ marginTop: "1rem" }}
          disabled={!agreed}
        >
          Zaregistrovat se
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default Register;
