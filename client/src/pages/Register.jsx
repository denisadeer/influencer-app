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

    if (password.length < 6) {
      setMessage("❌ Heslo musí mít alespoň 6 znaků.");
      return;
    }

    const realRole = role === "Podnik" ? "business" : role;

    try {
      const response = await fetch("/api/auth/register", {
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

      let data = {};
      try {
        data = await response.json();
      } catch {
        setMessage("❌ Chyba: neplatná odpověď ze serveru.");
        return;
      }

      if (response.ok) {
        setMessage("✅ Registrace proběhla úspěšně! Zkontroluj e-mail.");
      } else {
        setMessage(`❌ Chyba: ${data.message || "Něco se pokazilo."}`);
      }
    } catch {
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  return (
    <div className="container py-5">
      <div
        className="mx-auto rounded p-4"
        style={{
          maxWidth: "520px",
          backgroundColor: "#FFAC76",
        }}
      >
        {/* Logo + Nadpis */}
        <div className="text-center mb-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{ width: "120px", height: "120px" }}
          />
          <h3 className="mt-2 mb-0 logo-font">
  MicroMatch
</h3>

        </div>

        {/* Texty sjednocené */}
        <p className="text-dark fw-bold mb-1">Registrace</p>
        <p className="text-dark mb-3">Zaregistrujte se jako influencer nebo podnik.</p>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label">Uživatelské jméno</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Heslo</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="influencer">Influencer</option>
              <option value="Podnik">Podnik</option>
            </select>
          </div>

          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              id="termsCheck"
            />
            <label className="form-check-label" htmlFor="termsCheck">
              Souhlasím s{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#000DD2", fontWeight: "bold" }}
              >
                obchodními podmínkami
              </a>
            </label>
          </div>

          <button
  type="submit"
  className="btn-blue mt-2"
  disabled={!agreed}
>
  Zaregistrovat se
</button>
        </form>

        {message && <p className="mt-3">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
