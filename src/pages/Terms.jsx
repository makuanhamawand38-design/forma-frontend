import Nav from '../components/Nav'

export default function Terms() {
  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px', color: 'var(--ts)', lineHeight: 1.8, fontSize: 14 }}>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--t)', marginBottom: 8 }}>Villkor & Integritetspolicy</h1>
        <p style={{ color: 'var(--td)', marginBottom: 32 }}>Senast uppdaterad: 28 februari 2026</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>1. Om FORMA</h2>
        <p>FORMA ("vi", "oss", "vår") tillhandahåller personliga träningsprogram och kostscheman via webbplatsen formafitness.se. Genom att använda vår tjänst accepterar du dessa villkor.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>2. Tjänsten</h2>
        <p>FORMA genererar skräddarsydda träningsprogram och kostscheman baserat på den information du anger. Programmen är skapade med hjälp av AI-teknik och är avsedda som generell vägledning — inte medicinsk rådgivning.</p>
        <p style={{ marginTop: 8 }}>Vi rekommenderar att du konsulterar en läkare innan du påbörjar ett nytt tränings- eller kostprogram, särskilt om du har befintliga hälsotillstånd, skador eller allergier.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>3. Konto & Registrering</h2>
        <p>För att använda tjänsten kan du skapa ett konto med e-post och lösenord. Du ansvarar för att hålla dina inloggningsuppgifter säkra. Du kan även använda tjänsten som gäst med begränsad funktionalitet.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>4. Priser & Betalning</h2>
        <p>Alla priser visas i SEK inklusive moms. Betalning sker via Stripe. Vi erbjuder:</p>
        <p style={{ marginTop: 8 }}><strong style={{ color: 'var(--t)' }}>Engångsköp:</strong> En engångsbetalning som ger tillgång till ett program.</p>
        <p style={{ marginTop: 4 }}><strong style={{ color: 'var(--t)' }}>Pro-prenumeration:</strong> Månadsvis eller årsvis betalning som ger tillgång till nya program varje månad. Prenumerationen förnyas automatiskt och kan avslutas när som helst via ditt konto.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>5. Ångerrätt</h2>
        <p>Enligt distansavtalslagen har du 14 dagars ångerrätt. Observera att ångerrätten kan upphöra om du har börjat använda den digitala tjänsten (t.ex. genererat ditt program) och samtyckt till detta.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>6. Ansvarsfriskrivning</h2>
        <p>FORMA tillhandahåller tränings- och kostprogram som generell vägledning. Vi tar inget ansvar för skador, hälsoproblem eller andra konsekvenser som kan uppstå vid användning av våra program. Träna alltid inom dina egna gränser och sök professionell rådgivning vid behov.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>7. Integritetspolicy</h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.1 Vilka uppgifter samlar vi in?</h3>
        <p>Vi samlar in uppgifter du anger vid registrering och skapande av profil:</p>
        <p style={{ marginTop: 8, paddingLeft: 16 }}>
          • E-postadress och lösenord (krypterat)<br />
          • Namn<br />
          • Fysiska uppgifter: kön, ålder, vikt, längd<br />
          • Träningsmål, erfarenhet, utrustning<br />
          • Kostrestriktioner och allergier<br />
          • Betalinformation (hanteras av Stripe — vi lagrar inga kortuppgifter)
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.2 Hur använder vi dina uppgifter?</h3>
        <p style={{ paddingLeft: 16 }}>
          • Skapa personliga träningsprogram och kostscheman<br />
          • Hantera ditt konto och prenumeration<br />
          • Skicka orderbekräftelser och programleveranser via e-post<br />
          • Förbättra vår tjänst genom anonym analys (Google Analytics)
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.3 Cookies</h3>
        <p>Vi använder cookies för:</p>
        <p style={{ marginTop: 8, paddingLeft: 16 }}>
          • <strong style={{ color: 'var(--t)' }}>Nödvändiga cookies:</strong> Inloggning och sessionshantering<br />
          • <strong style={{ color: 'var(--t)' }}>Analyscookies:</strong> Google Analytics för att förstå hur besökare använder sidan (kan avvisas)
        </p>
        <p style={{ marginTop: 8 }}>Du kan hantera dina cookie-preferenser via bannern som visas vid ditt första besök.</p>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.4 Tredjeparter</h3>
        <p>Vi delar dina uppgifter med följande tredjeparter, enbart för att tillhandahålla tjänsten:</p>
        <p style={{ marginTop: 8, paddingLeft: 16 }}>
          • <strong style={{ color: 'var(--t)' }}>Stripe:</strong> Betalningshantering<br />
          • <strong style={{ color: 'var(--t)' }}>OpenAI:</strong> AI-generering av program (anonymiserad data)<br />
          • <strong style={{ color: 'var(--t)' }}>Google Analytics:</strong> Webbanalys
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.5 Dina rättigheter</h3>
        <p>Enligt GDPR har du rätt att:</p>
        <p style={{ marginTop: 8, paddingLeft: 16 }}>
          • Begära tillgång till dina personuppgifter<br />
          • Begära rättelse av felaktiga uppgifter<br />
          • Begära radering av dina uppgifter<br />
          • Återkalla samtycke till databehandling<br />
          • Invända mot behandling av dina uppgifter
        </p>
        <p style={{ marginTop: 8 }}>Kontakta oss på <a href="mailto:info@formafitness.se" style={{ color: 'var(--a)' }}>info@formafitness.se</a> för att utöva dina rättigheter.</p>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginTop: 20, marginBottom: 8 }}>7.6 Datalagring</h3>
        <p>Dina uppgifter lagras så länge du har ett aktivt konto. Vid radering av konto raderas alla personuppgifter inom 30 dagar.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>8. Ändringar</h2>
        <p>Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelas via e-post eller på webbplatsen.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginTop: 32, marginBottom: 12 }}>9. Kontakt</h2>
        <p>
          FORMA Fitness<br />
          E-post: <a href="mailto:info@formafitness.se" style={{ color: 'var(--a)' }}>info@formafitness.se</a><br />
          Webb: <a href="https://formafitness.se" style={{ color: 'var(--a)' }}>formafitness.se</a>
        </p>

      </div>
    </div>
  )
}