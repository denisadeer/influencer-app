import React, { useState } from "react";

function LandingPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Vítejte v MicroMatch</h1>
      <p>Spojujeme influencery a podniky pro efektivní spolupráci.</p>

      <p style={{ marginTop: "1rem" }}>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          Obchodní podmínky
        </a>
      </p>
    </div>
  );
}

export default LandingPage;



