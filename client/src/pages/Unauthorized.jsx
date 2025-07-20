import React from "react";

const Unauthorized = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>⛔ Přístup zamítnut</h2>
      <p>Nemáte oprávnění pro tuto stránku.</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
        Zpět na hlavní stránku
      </a>
    </div>
  );
};

export default Unauthorized;
