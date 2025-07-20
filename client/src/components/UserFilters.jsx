import React from 'react';

const UserFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Filtry</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* 🔍 Fulltext */}
        <input
          type="text"
          name="search"
          value={filters.search}
          placeholder="Hledat uživatele..."
          onChange={handleChange}
        />

        {/* 🎭 Role */}
        <select name="role" value={filters.role} onChange={handleChange}>
          <option value="">Všichni</option>
          <option value="influencer">Influencer</option>
          <option value="business">Business</option>
        </select>

        {/* 💳 Předplatné */}
        <select
          name="subscription"
          value={filters.subscription}
          onChange={handleChange}
        >
          <option value="">Všichni (plány)</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>

        {/* 📩 E-mail ověření */}
        <select
          name="emailVerified"
          value={filters.emailVerified}
          onChange={handleChange}
        >
          <option value="">Všichni (ověření)</option>
          <option value="true">Jen ověření</option>
          <option value="false">Jen neověření</option>
        </select>

        {/* 📍 Lokalita */}
        <input
          type="text"
          name="location"
          value={filters.location}
          placeholder="Filtrovat podle lokality..."
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default UserFilters;
