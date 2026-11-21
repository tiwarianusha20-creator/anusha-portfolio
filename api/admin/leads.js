import { db } from 'hatchable';

export const methods = ['GET', 'PATCH', 'DELETE'];
export const access = 'admin';

export default async function (req, res) {
  if (req.method === 'GET') {
    const result = await db.query(
      'SELECT id, name, email, interest, message, status, created_at FROM portfolio_leads ORDER BY created_at DESC LIMIT 200'
    );
    return res.json({ leads: result.rows });
  }

  const body = req.body || {};
  const id = Number(body.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'A valid enquiry ID is required.' });

  if (req.method === 'PATCH') {
    const status = typeof body.status === 'string' ? body.status : '';
    const allowed = ['New', 'Contacted', 'In Discussion', 'Converted', 'Not Interested'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Choose a valid status.' });
    const result = await db.query(
      'UPDATE portfolio_leads SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Enquiry not found.' });
    return res.json({ ok: true, lead: result.rows[0] });
  }

  if (req.method === 'DELETE') {
    const result = await db.query('DELETE FROM portfolio_leads WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Enquiry not found.' });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}