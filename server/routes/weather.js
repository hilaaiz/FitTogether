'use strict';

const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/authenticateToken');

let _fetch = global.fetch;
if (typeof _fetch !== 'function') {
  // npm i node-fetch
  _fetch = require('node-fetch');
}

const BASE = 'https://api.weatherapi.com/v1';
const { WEATHER_API_KEY: KEY } = process.env;

async function fetchCurrentByQ(q) {
  if (!KEY) throw new Error('Missing WEATHER_API_KEY');
  const url = `${BASE}/current.json?key=${encodeURIComponent(KEY)}&q=${encodeURIComponent(q)}&aqi=no`;
  const r = await _fetch(url);
  if (!r.ok) throw new Error(`WeatherAPI ${r.status}: ${await r.text()}`);
  return r.json();
}

/**
 * GET /weather/current/by-user   (JWT)
 * קדימויות:
 * 1) geo_lat/geo_lng → משתמשים בקואורדינטות
 * 2) אחרת city       → משתמשים בעיר (string)
 * 3) אחרת            → Jerusalem, Israel (דיפולט)
 */
router.get('/current/by-user', authenticateToken, async (req, res) => {
  try {
    if (!KEY) return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });

    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT city, geo_lat, geo_lng FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const { city, geo_lat, geo_lng } = rows[0];

    // ולידציה לקואורדינטות
    const lat = parseFloat(geo_lat);
    const lng = parseFloat(geo_lng);
    const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);

    const q = hasGeo
      ? `${lat},${lng}`
      : (city && `${city.trim()}, Israel`) || 'Jerusalem, Israel';

    const data = await fetchCurrentByQ(q);
    return res.json({ ...data, _source: 'by-user', _q: q });
  } catch (e) {
    // Fallback קשיח לירושלים אם משהו נשבר
    try {
      const fb = await fetchCurrentByQ('Jerusalem, Israel');
      return res.json({ ...fb, _fallback: 'jerusalem', _err: String(e) });
    } catch (e2) {
      return res.status(500).json({ error: 'Failed to fetch weather', detail: String(e2) });
    }
  }
});

module.exports = router;
