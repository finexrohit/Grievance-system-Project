import app from '../server/server.js';
import { ensureDB } from '../server/db.js';

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    console.error('Database connection error in Vercel handler:', err);
  }
  return app(req, res);
}
