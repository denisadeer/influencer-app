import React from "react";

function LandingPage() {
  return (
    <div>
      {/* Horní záhlaví */}
      <header className="d-flex justify-content-between align-items-center px-4 py-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          {/* Logo bylo odstraněno z headeru */}
          <h4 className="m-0 fs-5 logo-font">MicroMatch</h4>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <a href="/login" className="btn btn-orange">Přihlásit se</a>
          <a href="/register" className="btn btn-orange">Registrovat se</a>
        </div>
      </header>

      {/* Hero sekce */}
      <section
        className="pt-5 pb-4"
        style={{
          backgroundImage: 'url("/images/hero-wave.svg")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundColor: "#ffb395",
          minHeight: "400px",
        }}
      >
        <div className="container">
          <div className="row align-items-start g-4" style={{ paddingTop: "3rem" }}>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3 mb-4">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  style={{ width: "100px", height: "100px" }}
                />
                <h1 className="display-5 logo-font m-0">MicroMatch</h1>
              </div>
              <p className="fs-5">
                Spojujeme mikroinfluencery s podnikateli pro přirozenou reklamu.
                Snadná cesta ke spolupráci, která dává smysl. Bez agentur a velkých
                rozpočtů.
              </p>
              <p className="fst-italic mt-3">
                „Malý profil, velký vliv. Když doporučení opravdu něco znamená.“
              </p>
            </div>
            <div className="col-md-6">
              <img
                src="/images/hero-bg.png"
                alt="Grafika"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pro podniky a influencery */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm">
              <h2>Pro podniky</h2>
              <p>
                Nejlepší reklama? Doporučení od někoho, komu zákazníci věří.
                Mikroinfluenceři mají mezi sledujícími své kamarády, kolegy, sousedy – a právě proto jejich slovo tolik znamená. Menší dosah, větší vliv.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm">
              <h2>Pro influencery</h2>
              <p>
                Možná jste už influencer – jen o tom ještě nevíte. Vaše doporučení sledují kamarádi, známí a lidé, kterým na vás záleží. A právě proto máte větší vliv, než si myslíte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jak to funguje */}
      <section
        className="py-5 text-center text-white"
        style={{ backgroundColor: "#FFAC76" }}
      >
        <div className="container">
          <h2>Jak to funguje</h2>
          <img
            src="/images/jak-to-funguje.png"
            alt="Jak to funguje"
            className="img-fluid rounded shadow mt-3"
            style={{ maxWidth: "780px" }}
          />
        </div>
      </section>

      {/* Výhody */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm">
              <h3>Účet je vždy zdarma</h3>
              <p>
                Jako influencer čekáte na nabídky. Jako podnik máte přístup k databázi influencerů zdarma.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm">
              <h3>Influenceři mají větší zapojení</h3>
              <p>
                Až 5× vyšší engagement než velké profily. Důvěryhodnější než reklama. První 2 oslovení zdarma – poté od 129 Kč/měsíc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-4 text-white"
        style={{ backgroundColor: "#FFAC76" }}
      >
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0">&copy; 2025 MicroMatch</p>
          <p className="mb-0">
            <a href="/terms" className="text-white text-decoration-underline">Obchodní podmínky</a> |{" "}
            <a href="mailto:info@micromatch.cz" className="text-white">info@micromatch.cz</a>
          </p>
          <div className="d-flex gap-3 fs-4">
            <a href="https://instagram.com/tvujprofil" target="_blank" rel="noreferrer" className="text-white">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://facebook.com/tvujprofil" target="_blank" rel="noreferrer" className="text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://tiktok.com/@tvujprofil" target="_blank" rel="noreferrer" className="text-white">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
