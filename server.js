const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.get('/books', (req, res) => {
    console.log('GET /books requested');
    try {
        const data = fs.readFileSync('books.json', 'utf8');
        console.log('Books file read successfully');
        res.json(JSON.parse(data));
    } catch (error) {
        console.log('Books file not found, returning empty array');
        res.json({ books: [] });
    }
});

app.post('/books', (req, res) => {
    console.log('POST /books requested');
    console.log('Request body:', req.body);
    try {
        fs.writeFileSync('books.json', JSON.stringify(req.body, null, 2));
        console.log('Books file written successfully');
        console.log('File contents:', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.log('Error writing books file:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Open your browser and go to http://localhost:3000');
});