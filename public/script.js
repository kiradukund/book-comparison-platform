const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const googleResultsDiv = document.getElementById('googleResults');
const openLibraryResultsDiv = document.getElementById('openLibraryResults');

searchButton.addEventListener('click', searchBooks);

async function searchBooks() {
  const query = searchInput.value;

  if (!query) return;

  googleResultsDiv.innerHTML = 'Loading...';
  openLibraryResultsDiv.innerHTML = 'Loading...';

  // run both API calls at the same time instead of one after the other
  const [googleData, openLibraryData] = await Promise.all([
    fetchGoogleBooks(query),
    fetchOpenLibrary(query)
  ]);

  displayGoogleResults(googleData);
  displayOpenLibraryResults(openLibraryData);
}

async function fetchGoogleBooks(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    return await response.json();
  } catch (err) {
    return { error: 'Failed to reach Google Books' };
  }
}

async function fetchOpenLibrary(query) {
  try {
    const response = await fetch(`/api/search-openlibrary?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    return await response.json();
  } catch (err) {
    return { error: 'Failed to reach Open Library' };
  }
}

function displayGoogleResults(data) {
  googleResultsDiv.innerHTML = '';

  if (data.error || !data.items || data.items.length === 0) {
    googleResultsDiv.innerHTML = data.error
      ? 'Google Books is temporarily unavailable. Open Library results are still shown below.'
      : 'No results from Google Books.';
    return;
  }

  for (const book of data.items) {
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

    googleResultsDiv.appendChild(card);
  }
}

function displayOpenLibraryResults(data) {
  openLibraryResultsDiv.innerHTML = '';

  if (data.error || !data.docs || data.docs.length === 0) {
    openLibraryResultsDiv.innerHTML = data.error
      ? 'Open Library is temporarily unavailable.'
      : 'No results from Open Library.';
    return;
  }

  for (const book of data.docs) {
    const card = document.createElement('div');
    card.className = 'book-card';

    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : '';
    const author = book.author_name ? book.author_name.join(', ') : 'Unknown author';

    card.innerHTML = `
      <img src="${cover}" alt="${book.title}">
      <h3>${book.title}</h3>
      <p>${author}</p>
      <p>${book.edition_count ? book.edition_count + ' editions' : ''}</p>
    `;

    openLibraryResultsDiv.appendChild(card);
  }
}