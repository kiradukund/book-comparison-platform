// Book Comparison Platform
// Built by IRADUKUNDA CYUSA Kevin
// Software Engineering student, ALU
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

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
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    let data;
    let attempts = 0;
    const maxAttempts = 4;

    let lastError = false;

    while (attempts < maxAttempts) {
      attempts++;
      const response = await fetch(url);

      // check the actual HTTP status first, don't assume the body is valid JSON
      if (!response.ok) {
        lastError = true;
        const waitTime = attempts * 1000; // 1s, 2s, 3s, 4s
        console.log(`Attempt ${attempts} failed with status ${response.status}, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      data = await response.json();

      // Google sometimes returns 200 but with an error object in the body
      if (data.error) {
        lastError = true;
        const waitTime = attempts * 1000;
        console.log(`Attempt ${attempts} failed, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      lastError = false;
      break;
    }

    if (lastError || !data || data.error) {
      return res.status(503).json({ error: 'Google Books API is not responding right now. Try again in a moment.' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Google Books' });
  }
});

// search route - talks to Open Library
app.get('/api/search-openlibrary', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Open Library' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});