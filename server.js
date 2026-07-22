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
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const response = await fetch(url);
      data = await response.json();

      // if Google gave us a real error, wait a bit and try again
      if (data.error) {
        console.log(`Attempt ${attempts} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      break;
    }

    if (data.error) {
      return res.status(503).json({ error: 'Google Books API is not responding right now. Try again in a moment.' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Google Books' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});