import Nav from '../components/Nav'

export default function Guidelines() {
  return (
    <div>
      <Nav />
      <div className="gl-main">
        <div className="gl-container">
          <h1 className="gl-title">Community-riktlinjer</h1>
          <p className="gl-intro">
            FORMA är en plats för alla som vill bli starkare, snabbare och friskare.
            För att hålla vår community positiv och trygg ber vi dig följa dessa riktlinjer.
          </p>

          <div className="gl-section">
            <h2 className="gl-heading">Respekt och vänlighet</h2>
            <ul className="gl-list">
              <li>Behandla alla med respekt oavsett bakgrund, kön, ålder eller nivå</li>
              <li>Uppmuntra och stötta andra i deras träningsresa</li>
              <li>Undvik nedlåtande kommentarer om andras kropp eller prestationer</li>
            </ul>
          </div>

          <div className="gl-section">
            <h2 className="gl-heading">Innehåll</h2>
            <ul className="gl-list">
              <li>Dela träningsrelaterat innehåll — resultat, tips, motivation</li>
              <li>Använd inte stötande, hotfullt eller hatiskt språk</li>
              <li>Publicera inte spam, reklam eller vilseledande information</li>
              <li>Dela inte andras personliga information utan samtycke</li>
            </ul>
          </div>

          <div className="gl-section">
            <h2 className="gl-heading">Meddelanden</h2>
            <ul className="gl-list">
              <li>Skicka bara meddelanden som är relevanta och respektfulla</li>
              <li>Trakassera inte andra via DM</li>
              <li>Rapportera oönskade meddelanden direkt</li>
            </ul>
          </div>

          <div className="gl-section">
            <h2 className="gl-heading">Rapportering och blockering</h2>
            <ul className="gl-list">
              <li>Använd rapportera-knappen om du ser innehåll som bryter mot riktlinjerna</li>
              <li>Blockera användare som stör dig — de kan inte se dina inlägg eller skicka meddelanden</li>
              <li>Falska rapporter kan leda till att ditt konto begränsas</li>
            </ul>
          </div>

          <div className="gl-section">
            <h2 className="gl-heading">Konsekvenser</h2>
            <p className="gl-text">
              Användare som bryter mot riktlinjerna kan få varningar, tillfälliga avstängningar
              eller permanent blockering från FORMA. Vi granskar alla rapporter och agerar så
              snabbt vi kan.
            </p>
          </div>

          <div className="gl-footer">
            <p>Tack för att du hjälper oss skapa en bättre community!</p>
          </div>
        </div>
      </div>

      <style>{`
        .gl-main {
          min-height: 100vh;
          padding: 32px 16px 64px;
        }
        .gl-container {
          max-width: 640px;
          margin: 0 auto;
        }
        .gl-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--t);
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        .gl-intro {
          font-size: 15px;
          color: var(--ts);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .gl-section {
          margin-bottom: 28px;
        }
        .gl-heading {
          font-size: 18px;
          font-weight: 700;
          color: var(--t);
          margin-bottom: 12px;
        }
        .gl-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .gl-list li {
          position: relative;
          padding: 8px 0 8px 20px;
          font-size: 14px;
          color: var(--ts);
          line-height: 1.6;
        }
        .gl-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 16px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--a);
        }
        .gl-text {
          font-size: 14px;
          color: var(--ts);
          line-height: 1.7;
        }
        .gl-footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid var(--br);
          text-align: center;
        }
        .gl-footer p {
          font-size: 14px;
          color: var(--td);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
