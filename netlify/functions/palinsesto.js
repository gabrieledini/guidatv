// netlify/functions/palinsesto.js
// -----------------------------------------------------------------------------
// Proxy SERVER-SIDE per il palinsesto TV.
// Gira sui server di Netlify, quindi NON ha il problema del CORS: scarica la
// pagina da Hyle TV e la restituisce al browser con gli header giusti.
// Niente più dipendenza da proxy pubblici (allorigins, corsproxy, ...).
// -----------------------------------------------------------------------------

const BASE = "https://hyle.appspot.com/palinsesto/";

// Solo questi percorsi sono ammessi: così la function NON diventa un
// "open proxy" che chiunque può usare per scaricare qualsiasi sito.
const CONSENTITI = {
  serata: "serata",
  pomeriggio: "pomeriggio",
  mattina: "mattina",
};

exports.handler = async (event) => {
  // fascia opzionale: ?fascia=serata (default) | pomeriggio | mattina
  const q = event.queryStringParameters || {};
  const slug = CONSENTITI[q.fascia] || CONSENTITI.serata;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/html; charset=utf-8",
    // Cache leggera lato CDN Netlify: serviamo la stessa pagina per 30 min
    // così non bombardiamo la fonte e l'app risponde all'istante.
    "Cache-Control": "public, max-age=600, s-maxage=1800",
  };

  try {
    // Su Netlify (Node 18+) fetch è globale: niente import da installare.
    const resp = await fetch(BASE + slug, {
      headers: { "User-Agent": "Mozilla/5.0 (TeleguidaPWA)" },
    });

    if (!resp.ok) {
      return {
        statusCode: 502,
        headers,
        body: "Fonte non raggiungibile (HTTP " + resp.status + ")",
      };
    }

    const html = await resp.text();
    return { statusCode: 200, headers, body: html };
  } catch (err) {
    return { statusCode: 502, headers, body: "Errore proxy: " + err.message };
  }
};
