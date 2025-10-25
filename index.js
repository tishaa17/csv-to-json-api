// index.js
const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');
const { parseCSV } = require('./csvParser');
dotenv.config();

const app = express();
app.use(express.json());

const CSV_PATH = process.env.CSV_FILE_PATH || './sample.csv';

// Simple health
app.get('/', (req, res) => res.send('CSV → Postgres API is running'));

// Upload endpoint: parse CSV and insert into users table
app.get('/upload', async (req, res) => {
  try {
    const rows = parseCSV(CSV_PATH);
    if (!rows.length) return res.status(400).send('CSV is empty or not found.');

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const r of rows) {
        // We will store: name = "First Last", age = number, address = JSONB, additional_info = JSONB

        const first = (r.name && r.name.firstName) ? r.name.firstName : '';
        const last = (r.name && r.name.lastName) ? r.name.lastName : '';
        const name = (first || last) ? `${first} ${last}`.trim() : (r.name || '');

        const age = Number(r.age) || null;
        const address = r.address || null;

        // build additional_info: entire row but remove top-level name and age and address
        const additional = JSON.parse(JSON.stringify(r));
        delete additional.name;
        delete additional.age;
        delete additional.address;

        const text = `
          INSERT INTO users (name, age, address, additional_info)
          VALUES ($1, $2, $3, $4)
        `;
        const values = [name, age, address, Object.keys(additional).length ? additional : null];
        await client.query(text, values);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // generate report immediately after insertion
    const report = await generateAgeReport();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ message: 'Upload complete', inserted: rows.length, report }));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during upload: ' + (err.message || err));
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching users');
  }
});



// Report endpoint only (age distribution)
app.get('/report', async (req, res) => {
  try {
    const report = await generateAgeReport();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(report));
  } catch (err) {
    res.status(500).send('Error generating report');
  }
});


async function generateAgeReport() {
  const result = await pool.query('SELECT age FROM users WHERE age IS NOT NULL');
  const ages = result.rows.map(r => Number(r.age)).filter(a => !Number.isNaN(a));
  const total = ages.length || 1; // avoid division by zero

  const groups = { '<20': 0, '20-40': 0, '40-60': 0, '>60': 0 };
  for (const a of ages) {
    if (a < 20) groups['<20']++;
    else if (a <= 40) groups['20-40']++;
    else if (a <= 60) groups['40-60']++;
    else groups['>60']++;
  }

  // convert to percentages & raw counts
  const out = {};
  for (const k of Object.keys(groups)) {
    out[k] = { count: groups[k], pct: ((groups[k] / total) * 100).toFixed(2) + '%' };
  }
  out.total = ages.length;
  return out;
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
