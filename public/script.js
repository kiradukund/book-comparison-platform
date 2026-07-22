const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');

searchButton.addEventListener('click', searchBooks);

async function searchBooks() {
  const query = searchInput.value;

  if (!query) return;

  resultsDiv.innerHTML = 'Loading...';

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    const data = await response.json();

    displayResults(data.items);
  } catch (err) {
    resultsDiv.innerHTML = 'Something went wrong. Try again.';
  }
}

function displayResults(books) {
  resultsDiv.innerHTML = '';

  if (!books || books.length === 0) {
    resultsDiv.innerHTML = 'No books found.';
    return;
  }

  for (const book of books) {
    const info = book.volumeInfo;

    const card = document.createElement('div');
    card.className = 'book-card';

    const cover = info.imageLinks ? info.imageLinks.thumbnail : '';
    const author = info.authors ? info.authors.join(', ') : 'Unknown author';

    card.innerHTML = `
      <img src="${cover}" alt="${info.title}">
      <h3>${info.title}</h3>
      <p>${author}</p>
      <p>${info.pageCount ? info.pageCount + ' pages' : ''}</p>
    `;

    resultsDiv.appendChild(card);
  }
}