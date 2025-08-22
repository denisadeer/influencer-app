import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

function Terms() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Hlavička jako všude */}
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
              <img src="/images/logo.png" alt="Logo" style={{ width: 70, height: 70 }} />
              <h2 className="mt-2 text-dark" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                MicroMatch
              </h2>
            </div>
          </header>

          {/* Obsah podmínek – meruňková karta */}
          <div className="set-custom-side-bar p-4" style={{ borderRadius: 10 }}>
            <h3 className="mb-3">Obchodní podmínky</h3>
            <p className="text-muted mb-4">Poslední aktualizace: 21. 08. 2025</p>

            {/* Rychlá navigace */}
            <div className="mb-4" style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: 12 }}>
              <ul className="m-0 p-3">
                <li><a href="#1">1. Úvod</a></li>
                <li><a href="#2">2. Účty a registrace</a></li>
                <li><a href="#3">3. Obsah uživatelů</a></li>
                <li><a href="#4">4. Platby a předplatné</a></li>
                <li><a href="#5">5. Odpovědnost</a></li>
                <li><a href="#6">6. Ochrana osobních údajů</a></li>
                <li><a href="#7">7. Změny podmínek</a></li>
                <li><a href="#8">8. Kontakt</a></li>
              </ul>
            </div>

            {/* Sekce */}
            <section id="1" className="mb-4">
              <h5>1. Úvod</h5>
              <p>
                Tyto obchodní podmínky upravují používání platformy MicroMatch. Vstupem či používáním služby
                potvrzujete, že jste si podmínky přečetli a souhlasíte s nimi.
              </p>
            </section>

            <section id="2" className="mb-4">
              <h5>2. Účty a registrace</h5>
              <ul className="mb-0">
                <li>Jste povinni uvádět pravdivé, přesné a aktuální údaje.</li>
                <li>Za bezpečnost svého účtu a hesla nesete odpovědnost vy.</li>
                <li>Účet může být pozastaven či zrušen při porušení podmínek.</li>
              </ul>
            </section>

            <section id="3" className="mb-4">
              <h5>3. Obsah uživatelů</h5>
              <ul className="mb-0">
                <li>Za veškerý nahraný či sdílený obsah odpovídá uživatel.</li>
                <li>Zakázán je nezákonný, klamavý či porušující obsah.</li>
                <li>Udělujete nám nevýhradní licenci k technickému zobrazení obsahu v rámci služby.</li>
              </ul>
            </section>

            <section id="4" className="mb-4">
              <h5>4. Platby a předplatné</h5>
              <ul className="mb-0">
                <li>Ceny jsou uvedeny v rozhraní služby a mohou se měnit.</li>
                <li>Předplatné se může automaticky obnovovat, pokud není zrušeno.</li>
                <li>Případné reklamace plateb řeší zákaznická podpora.</li>
              </ul>
            </section>

            <section id="5" className="mb-4">
              <h5>5. Odpovědnost</h5>
              <p className="mb-0">
                MicroMatch nenese odpovědnost za obsah profilů ani za komunikaci či spolupráci mezi uživateli.
                Služba je poskytována „tak jak je“, bez záruk.
              </p>
            </section>

            <section id="6" className="mb-4">
              <h5>6. Ochrana osobních údajů</h5>
              <p className="mb-0">
                Zpracování osobních údajů se řídí zásadami ochrany soukromí (Privacy Policy). Odkaz naleznete v patičce
                webu nebo v uživatelském rozhraní.
              </p>
            </section>

            <section id="7" className="mb-4">
              <h5>7. Změny podmínek</h5>
              <p className="mb-0">
                Podmínky můžeme občas aktualizovat. O podstatných změnách vás budeme informovat vhodným způsobem
                (např. notifikací v aplikaci).
              </p>
            </section>

            <section id="8" className="mb-2">
              <h5>8. Kontakt</h5>
              <p className="mb-0">
                Máte dotazy? Napište nám přes podporu v aplikaci nebo e-mailem na <em>support@micromatch.example</em>.
              </p>
            </section>

            {/* Akce dole */}
            <div className="mt-4 d-flex gap-2">
              <button className="set-btn-custom" onClick={() => navigate(-1)}>↩️ Zpět</button>
              <button className="set-btn-white-custom" onClick={() => navigate("/register")}>
                Souhlasím a chci pokračovat
              </button>
            </div>
          </div>

          <div className="my-3" />
        </div>
      </div>
    </div>
  );
}

export default Terms;
