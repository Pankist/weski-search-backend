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

// Load API endpoints from JSON file
const loadApiEndpoints = async () => {
    const data = await fs.readFile(path.join(__dirname, 'apiEndpoints.json'), 'utf-8');
    return JSON.parse(data);
};

// Load ski resorts from JSON file
const loadSkiResorts = async () => {
    const data = await fs.readFile(path.join(__dirname, 'skiResorts.json'), 'utf-8');
    return JSON.parse(data);
};

// Fetch hotels from a single API
const fetchHotels = async (apiUrl, query) => {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error(`Failed to fetch hotels from ${apiUrl}`);
    return response.json();
};

// Stream results to client
const streamResultsToClient = async (req, res, query) => {
    const apiEndpoints = await loadApiEndpoints();
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    });

    for (const api of apiEndpoints) {
        try {
            const data = await fetchHotels(api.url, query);
            res.write(JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching data:', error.message); // Log error without breaking the loop
        }
    }
    res.end();
};

app.post('/search', (req, res) => {
    const query = req.body.query;
    streamResultsToClient(req, res, query).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

app.listen(PORT, async () => {
    const skiResorts = await loadSkiResorts();
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Ski Resorts:', skiResorts);
});