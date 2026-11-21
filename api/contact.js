import { db } from 'hatchable';

export const methods = ['POST'];
export const access = 'public';

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const body = req.body || {};
  // Quietly accept honeypot submissions without storing them.
  if (clean(body.website, 200)) return res.json({ ok: true });
  const name = clean(body.name, 100);
  const email = clean(body.email, 180).toLowerCase();
  const interest = clean(body.interest, 100);
  const message = clean(body.message, 3000);
  if (!name || !email || !interest || !message) return res.status(400).json({ error: 'Please complete all required fields.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length < 8) return res.status(400).json({ error: 'Please add a little more detail to your message.' });
  try {
    const recent = await db.query(
      "SELECT COUNT(*)::int AS n FROM portfolio_leads WHERE email = $1 AND created_at > NOW() - INTERVAL '1 minute'",
      [email]
    );
    if ((recent.rows[0]?.n || 0) >= 3) return res.status(429).json({ error: 'Please wait a moment before sending another message.' });
    const saved = await db.query(
      'INSERT INTO portfolio_leads (name, email, interest, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, interest, message]
    );
    return res.status(201).json({ ok: true, id: saved.rows[0].id });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return res.status(500).json({ error: 'Your message could not be saved right now. Please email me directly.' });
  }
}