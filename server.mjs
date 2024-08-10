import express from 'express';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const fetchHotels = async (query) => {
  const response = await fetch('https://gya7b1xubh.execute-api.eu-west-2.amazonaws.com/default/HotelsSimulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) throw new Error('Failed to fetch hotels');
  return response.json();
};

// Load ski resorts from JSON file
const loadSkiResorts = async () => {
  const data = await fs.readFile(path.join(__dirname, 'skiResorts.json'), 'utf-8');
  return JSON.parse(data);
};

app.post('/search', async (req, res) => {
  try {
    const query = req.body.query;
    const results = await fetchHotels(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  const skiResorts = await loadSkiResorts();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Ski Resorts:', skiResorts);
});
