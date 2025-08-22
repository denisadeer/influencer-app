import React, { useEffect, useState } from "react";
import UserFilters from "../components/UserFilters";
import { useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

const API_BASE = "http://localhost:5713";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    subscription: "",
    emailVerified: "",
    location: "",
  });

  // 🧹 Mazání uživatele
  const deleteUser = async (userId) => {
    if (!window.confirm("Opravdu chceš tohoto uživatele smazat?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Chyba při mazání uživatele");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  // 📥 Načtení uživatelů
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Chyba při načítání uživatelů");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 🧠 Filtrování
  useEffect(() => {
    let result = [...users];
    if (filters.role) result = result.filter((u) => u.role === filters.role);
    if (filters.subscription)
      result = result.filter((u) => u.subscriptionPlan === filters.subscription);
    if (filters.emailVerified)
      result = result.filter(
        (u) => String(u.emailVerified) === filters.emailVerified
      );
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter((u) => u.location?.toLowerCase().includes(loc));
    }
    setFilteredUsers(result);
  }, [filters, users]);

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-11 col-lg-10">
          {/* Hlavička */}
          <header className="text-center py-3 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197, 197, 197)",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <img
                src="/images/logo.png"
                alt="Logo"
                style={{ width: 70, height: 70 }}
              />
              <h2
                className="mt-2 text-dark"
                style={{ fontFamily: "'Segoe UI', sans-serif" }}
              >
                MicroMatch – Admin
              </h2>
            </div>
          </header>

          {/* Filtrování */}
          <div className="set-custom-side-bar p-3 mb-4" style={{ borderRadius: 10 }}>
            <h5>🔍 Filtry</h5>
            <UserFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Tabulka uživatelů */}
          <div className="set-custom-side-bar p-3" style={{ borderRadius: 10 }}>
            <h5>👥 Uživatelé</h5>
            {loading && <p>Načítám uživatele…</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>👤 Uživatelské jméno</th>
                      <th>📧 Email</th>
                      <th>🎭 Role</th>
                      <th>📦 Předplatné</th>
                      <th>✅ Ověření</th>
                      <th>📍 Lokalita</th>
                      <th>⚙️ Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.username || "—"}</td>
                        <td>{user.email || "—"}</td>
                        <td>{user.role}</td>
                        <td>{user.subscriptionPlan || "—"}</td>
                        <td>
                          {user.emailVerified ? "✅" : "❌"}
                        </td>
                        <td>{user.location || "—"}</td>
                        <td>
                          <button
                            className="set-btn-custom me-2"
                            onClick={() => navigate(`/admin/user/${user._id}`)}
                          >
                            Profil
                          </button>
                          <button
                            className="set-btn-white-custom"
                            onClick={() => deleteUser(user._id)}
                          >
                            Smazat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="text-center mt-3">❌ Žádní uživatelé nenalezeni.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
