// csvParser.js
const fs = require('fs');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];

  const lines = content.split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // simple split 
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      setNested(obj, headers[j].split('.'), convertValue(values[j]));
    }
    rows.push(obj);
  }
  return rows;
}

function setNested(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (!cur[p]) cur[p] = {};
    cur = cur[p];
  }
  cur[path[path.length - 1]] = value;
}

function convertValue(v) {
  if (v === undefined) return null;
  if (v === '') return '';
  // try integer
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  // try float
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

module.exports = { parseCSV };
