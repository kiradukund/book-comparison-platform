require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// test route so we know the server is alive
app.get('/', (req, res) => {
  res.send('Server is running');
});

// search route - talks to Google Books
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Google Books' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});