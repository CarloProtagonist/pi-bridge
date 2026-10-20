"use strict";
/**
 * Minimal Web Push (VAPID + ECE aes128gcm), ZERO npm dependencies.
 *
 * - VAPID keys are P-256, stored as base64url strings:
 *     publicKey  = 65-byte uncompressed point (0x04 || X || Y)
 *     privateKey = 32-byte scalar
 *   in ~/.config/pibridge/vapid.json (same on-the-wire format web-push emits).
 * - The VAPID JWT is ES256. We sign with Node's built-in EC support by
 *   reconstructing the key from the JWK (scalar d + point x/y) and converting
 *   Node's DER signature to the 64-byte raw r||s that JWS/ES256 requires.
 * - Payloads are ECE `aes128gcm`-encrypted via lib-ece.js
 *   (martinthomson/encrypted-content-encoding, MIT, pure JS, vendored here).
 * - Delivery is a POST to the FCM / push-endpoint URL the browser supplied.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { URL } = require("node:url");
const ece = require("./lib-ece.js");

const b64url = (buf) => Buffer.from(buf).toString("base64url");
const fromB64url = (s) => Buffer.from(String(s), "base64url");
const pad32 = (b) => (b.length < 32 ? Buffer.concat([Buffer.alloc(32 - b.length), b]) : b);
const strip = (b) => (b.length === 33 && b[0] === 0 ? b.subarray(1) : b);

// --------------------------------------------------------------------- VAPID keys
function loadKeys(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, "utf8"));
    if (j.publicKey && j.privateKey && j.subject) return j;
  } catch {}
  const priv = crypto.randomBytes(32);
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(priv);
  const pub = ecdh.getPublicKey();        // 65 bytes
  return {
    publicKey: b64url(pub),
    privateKey: b64url(priv),
    subject: "mailto:crispy@crispy-pc"
  };
}
function saveKeys(file, keys) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(keys, null, 1), { mode: 0o600 });
}

// --------------------------------------------------------------------- ES256 JWT
function privKeyObject(privB64url) {
  const d = fromB64url(privB64url);
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(d);
  const pt = ecdh.getPublicKey();
  return crypto.createPrivateKey({
    key: { kty: "EC", crv: "P-256", d: b64url(d), x: b64url(pt.subarray(1, 33)), y: b64url(pt.subarray(33, 65)) },
    format: "jwk"
  });
}
function derToRssig(der) {
  // 30 <len> 02 <lr> r 02 <ls> s  ->  r(32) || s(32)
  let i = 0;
  if (der[i++] !== 0x30) throw new Error("sig: not a SEQUENCE");
  i += 1; // length byte (short form for <=127)
  const getInt = () => {
    if (der[i++] !== 0x02) throw new Error("sig: bad INTEGER tag");
    const l = der[i++];
    const b = der.subarray(i, i + l);
    i += l;
    return b;
  };
  return Buffer.concat([pad32(strip(getInt())), pad32(strip(getInt()))]);
}
function b64json(obj) { return b64url(Buffer.from(JSON.stringify(obj), "utf8")); }

/** Produce a `header.payload.signature` ES256 JWT for a FCM audience. */
function vapidJwt(audience, privKeyB64url, subject, ttlSec) {
  const header = b64json({ typ: "JWT", alg: "ES256" });
  const payload = b64json({
    aud: audience,
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + (ttlSec || 900)
  });
  const input = Buffer.from(header + "." + payload, "utf8");
  const sig = crypto.sign(null, input, privKeyObject(privKeyB64url)); // DER
  return header + "." + payload + "." + b64url(derToRssig(sig));
}

// --------------------------------------------------------------------- ECE (aes128gcm)
function eceEncrypt(sub, payloadBuf) {
  const local = crypto.createECDH("prime256v1");
  const localPub = local.generateKeys();  // 65-byte ephemeral
  const ct = ece.encrypt(payloadBuf, {
    version: "aes128gcm",
    dh: fromB64url(sub.keys.p256dh),
    privateKey: local,
    salt: crypto.randomBytes(16),
    authSecret: fromB64url(sub.keys.auth)
  });
  return { localPub, ct };
}

// --------------------------------------------------------------------- delivery
function postPush(endpoint, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(endpoint);
    const req = https.request(u, { method: "POST", headers, timeout: 15000 }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("timeout", () => req.destroy(new Error("push endpoint timeout")));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

/** Send one push. Rejects with e.status on 4xx (404/410 => drop the sub). */
async function send(sub, payload, vapid) {
  const u = new URL(sub.endpoint);
  const jwt = vapidJwt(u.protocol + "//" + u.host, vapid.privateKey, vapid.subject, 900);
  const { localPub, ct } = eceEncrypt(sub, Buffer.from(payload, "utf8"));
  // Stable, per-endpoint Topic (FCM dedups by this; base64url of sha256, 22 chars).
  const topic = crypto.createHash("sha256").update(sub.endpoint).digest("base64url").slice(0, 22);
  const headers = {
    "Content-Type": "application/octet-stream",
    "Content-Encoding": "aes128gcm",
    "Content-Length": Buffer.byteLength(ct),
    "Authorization": "vapid t=" + jwt + ", k=" + vapid.publicKey,
    "TTL": "1200",
    "Urgency": "high",
    "Topic": topic
  };
  const r = await postPush(sub.endpoint, headers, ct);
  if (r.status < 200 || r.status > 299) {
    const e = new Error("push " + r.status + (r.body ? ": " + r.body.slice(0, 200) : ""));
    e.status = r.status;
    throw e;
  }
}

/** Fan out to all subs.
 *  - `gone`    = 404/410 — endpoint truly dead; caller should delete the sub.
 *  - `transient` = 429/411/5xx — temporary failure; caller must KEEP the sub.
 */
async function fanout(subs, payload, vapid) {
  let ok = 0;
  const gone = [];
  const transient = [];
  await Promise.all(subs.map(async (sub) => {
    try { await send(sub, payload, vapid); ok++; }
    catch (e) {
      const s = e && e.status;
      if (s === 404 || s === 410) gone.push(sub.endpoint);
      else if (s === 429 || s === 411 || (s >= 500 && s < 600)) transient.push(sub.endpoint);
      else console.error("[webpush] send error:", e && (e.message || String(e)));
    }
  }));
  return { ok, gone, transient };
}

module.exports = {
  loadKeys, saveKeys, vapidJwt, send, fanout, eceEncrypt,
  b64url, fromB64url,
  // exposed for self-testing only
  _test: { derToRssig, privKeyObject }
};
