// netlify/functions/palinsesto.js
// -----------------------------------------------------------------------------
// Proxy SERVER-SIDE per il palinsesto TV (niente CORS).
// Gira sui server Netlify: scarica la fonte richiesta e la restituisce al
// browser con gli header giusti.
//
//   ?src=hyle     (default)  -> generalisti/semigeneralisti  (Hyle TV)
//   ?src=ragazzi             -> canali per bambini/ragazzi    (SuperGuidaTV)
//   ?fascia=serata|pomeriggio|mattina
// -----------------------------------------------------------------------------

// Allowlist: la function puo' scaricare SOLO questi URL (niente open proxy).
const FONTI = {
  hyle: {
    serata: "https://hyle.appspot.com/palinsesto/serata",
    pomeriggio: "https://hyle.appspot.com/palinsesto/pomeriggio",
    mattina: "https://hyle.appspot.com/palinsesto/mattina",
  },
  ragazzi: {
    serata: "https://www.superguidatv.it/serata/",
    pomeriggio: "https://www.superguidatv.it/pomeriggio/",
    mattina: "https://www.superguidatv.it/mattina/",
  },
};

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const src = FONTI[q.src] ? q.src : "hyle";
  const fascia = FONTI[src][q.fascia] ? q.fascia : "serata";
  const target = FONTI[src][fascia];

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=600, s-maxage=1800",
  };

  try {
    const resp = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9",
      },
    });
    if (!resp.ok) {
      return { statusCode: 502, headers, body: "Fonte non raggiungibile (HTTP " + resp.status + ")" };
    }
    const html = await resp.text();
    return { statusCode: 200, headers, body: html };
  } catch (err) {
    return { statusCode: 502, headers, body: "Errore proxy: " + err.message };
  }
};
