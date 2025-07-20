import React, { useEffect, useState } from 'react';
import UserFilters from '../components/UserFilters';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    subscription: '',
    emailVerified: '',
    location: '',
  });

  // 🧹 Mazání uživatele
  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm('Opravdu chceš tohoto uživatele smazat?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Chyba při mazání uživatele');
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  // 📥 Načtení uživatelů
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Chyba při načítání uživatelů');
        }

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

    if (filters.role) {
      result = result.filter((user) => user.role === filters.role);
    }

    if (filters.subscription) {
      result = result.filter((user) => user.subscriptionPlan === filters.subscription);
    }

    if (filters.emailVerified) {
      result = result.filter(
        (user) => String(user.emailVerified) === filters.emailVerified
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter(
        (user) => user.location?.toLowerCase().includes(loc)
      );
    }

    setFilteredUsers(result);
  }, [filters, users]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>

      {loading && <p>Načítám uživatele...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <UserFilters filters={filters} setFilters={setFilters} />

          <ul>
            {filteredUsers.map((user) => (
              <li key={user._id} style={{ marginBottom: '1rem' }}>
                <strong>{user.username}</strong> ({user.email ?? '–'}) – Role: {user.role}
                {user.role === 'business' && user.subscriptionPlan && (
                  <> | Předplatné: {user.subscriptionPlan}</>
                )}
                {typeof user.emailVerified !== 'undefined' && (
                  <> | Ověřen: {user.emailVerified ? '✅' : '❌'}</>
                )}
                {user.location && (
                  <> | Lokalita: {user.location}</>
                )}

                {/* 🆕 Tlačítko Profil */}
                <button
                  onClick={() => navigate(`/admin/user/${user._id}`)}
                  style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    marginLeft: '1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Profil
                </button>

                {/* 🧹 Tlačítko Smazat */}
                <button
                  onClick={() => deleteUser(user._id)}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    marginLeft: '1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Smazat
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
