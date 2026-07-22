const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const googleResultsDiv = document.getElementById('googleResults');
const openLibraryResultsDiv = document.getElementById('openLibraryResults');
const googleSort = document.getElementById('googleSort');
const openLibrarySort = document.getElementById('openLibrarySort');

// keep the last fetched results here so we can re-sort without calling the APIs again
let lastGoogleBooks = [];
let lastOpenLibraryBooks = [];

searchButton.addEventListener('click', searchBooks);
googleSort.addEventListener('change', () => renderGoogleResults(lastGoogleBooks));
openLibrarySort.addEventListener('change', () => renderOpenLibraryResults(lastOpenLibraryBooks));

async function searchBooks() {
  const query = searchInput.value;

  if (!query) return;

  googleResultsDiv.innerHTML = 'Loading...';
  openLibraryResultsDiv.innerHTML = 'Loading...';

  const [googleData, openLibraryData] = await Promise.all([
    fetchGoogleBooks(query),
    fetchOpenLibrary(query)
  ]);

  if (googleData.error || !googleData.items) {
    lastGoogleBooks = [];
    googleResultsDiv.innerHTML = googleData.error
      ? 'Google Books is temporarily unavailable. Open Library results are still shown below.'
      : 'No results from Google Books.';
  } else {
    lastGoogleBooks = googleData.items;
    renderGoogleResults(lastGoogleBooks);
  }

  if (openLibraryData.error || !openLibraryData.docs) {
    lastOpenLibraryBooks = [];
    openLibraryResultsDiv.innerHTML = openLibraryData.error
      ? 'Open Library is temporarily unavailable.'
      : 'No results from Open Library.';
  } else {
    lastOpenLibraryBooks = openLibraryData.docs;
    renderOpenLibraryResults(lastOpenLibraryBooks);
  }
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

function renderGoogleResults(books) {
  if (books.length === 0) return;

  const sortValue = googleSort.value;
  const sorted = [...books];

  if (sortValue === 'title') {
    sorted.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
  } else if (sortValue === 'pages') {
    sorted.sort((a, b) => (b.volumeInfo.pageCount || 0) - (a.volumeInfo.pageCount || 0));
  }

  googleResultsDiv.innerHTML = '';

  for (const book of sorted) {
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

function renderOpenLibraryResults(books) {
  if (books.length === 0) return;

  const sortValue = openLibrarySort.value;
  const sorted = [...books];

  if (sortValue === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === 'editions') {
    sorted.sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0));
  }

  openLibraryResultsDiv.innerHTML = '';

  for (const book of sorted) {
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