# Book Comparison Platform

**Live site:** https://www.kiralekund.tech
**Demo video:** PASTE_DEMO_VIDEO_LINK_HERE

This is a small web app that lets you search for a book and see results from two different sources at once — Google Books and Open Library. Instead of trusting one API's version of a book's details, you get both side by side and can compare things like page count and how many editions exist. I built this for my Software Engineering "Playing Around with APIs" assignment.

## Why I Built This

Picking a book edition to buy or read is annoying when the information is scattered. One site says 300 pages, another says 250, and you're not sure which edition they're even talking about. I wanted something that pulls from more than one source so you can actually compare instead of just trusting whatever the first search result says.

## Features

- Search for any book by title
- Results shown from Google Books and Open Library at the same time, in separate sections
- Sort Google Books results by title or page count
- Sort Open Library results by title or number of editions
- Filter Google Books results by category (like "fiction")
- Filter Open Library results by language code (like "eng")
- If one API fails or is slow, the app still shows results from the other one instead of breaking
- Automatic retry if Google's API returns an error, before giving up and showing a message

## Screenshots

_(screenshots go here once I have the final deployed version)_

## Technologies Used

I used plain HTML, CSS, and JavaScript for the frontend instead of a framework like React because the assignment didn't need anything that complicated, and I wanted to actually understand every part of what I was writing instead of relying on a framework to handle things for me.

For the backend I used Node.js with Express. Express made it simple to set up routes that talk to the external APIs without exposing my API key to anyone looking at the frontend code.

## APIs Used

**Google Books API**
- Purpose: main source of book data — titles, authors, page counts, cover images
- Docs: _(link placeholder)_
- Needs an API key: yes
- What it gives: title, authors, publisher, page count, cover image, categories

**Open Library API**
- Purpose: second source, mainly used to compare edition counts and check different language versions
- Docs: _(link placeholder)_
- Needs an API key: no
- What it gives: title, authors, edition count, first publish year, language, cover image

I picked these two because they're both free and don't need payment info to get an API key, which mattered since this is a school project and not something I'm running long term.

## Project Structure

book-comparison-platform/
├── server.js          → Express server, routes for both APIs, retry logic
├── package.json
├── .env                → holds my Google Books API key (not committed)
├── .gitignore
└── public/
    ├── index.html      → the search page
    ├── style.css       → styling for the page and book cards
    └── script.js       → handles searching, sorting, filtering, rendering cards

## Installation

Clone the repo:

git clone https://github.com/kiradukund/book-comparison-platform.git
cd book-comparison-platform

Install dependencies:

npm install

## Environment Variables

You need a `.env` file in the root of the project with your own Google Books API key:

GOOGLE_BOOKS_API_KEY=your_key_here

I got mine from Google Cloud Console by enabling the Books API and creating an API key restricted to just that API. Open Library doesn't need a key at all, which made testing that part a lot easier since I didn't have to worry about quotas.

## Running Locally

npm run dev

Then open `http://localhost:3000` in your browser. Type a book title in the search box and press Search.

## Deployment

The app is deployed on two AWS servers, Web01 and Web02, sitting behind a load balancer (HAProxy) that I set up earlier in my DevOps coursework. The domain is kiralekund.tech.

On each server I installed Node.js 20 and git, cloned the repo from GitHub, ran `npm install`, and created a `.env` file directly on the server with my Google Books API key (it's gitignored so it never comes through GitHub, has to be added manually on each machine).

The app itself runs on port 3000 on both servers, but that port isn't open to the outside world, and it shouldn't be — only ports 80 and 443 are open. So I set up Nginx as a reverse proxy on both Web01 and Web02, listening on port 80 and quietly forwarding requests to the Node app on port 3000. This also matches what the load balancer expects, since HAProxy was already configured to send traffic to each server on port 80.

To keep the app running permanently instead of just while a terminal window is open, I used pm2 to run it as a background process, and set it up to auto-restart if either server ever reboots.

To test that the load balancer actually distributes traffic instead of just hitting one server, I checked HAProxy's logs directly:

## Challenges

Reading Google Books' documentation took longer than I expected because the response structure is pretty deep — book info is nested a few levels in, and not every book has every field. Some books don't have a cover image or a page count at all, so I had to add checks for that instead of assuming the data would always be there.

The two APIs also don't agree on much. Google Books gives page counts, Open Library gives edition counts instead, so I couldn't just show the same fields for both — I had to design the sort and filter options separately for each section.

The most annoying problem was that Google's Books API kept returning random 503 errors, completely unrelated to anything in my own code. I confirmed this by hitting the API directly in the browser and getting the same error, so it wasn't a bug on my end. I ended up adding retry logic with increasing wait times between attempts, and a clear fallback message if it still fails after a few tries, so the app doesn't just break or show a blank page when that happens.

## Lessons Learned

I learned that external APIs are not something you can fully control or trust to always work, so error handling isn't optional — it's part of actually building something usable. I also learned that combining two APIs means writing separate logic for each one rather than trying to force them into one shared format, since the data just doesn't line up cleanly.

## Future Improvements

- Real price comparison, if I can find a reliable free source for it
- Matching the same book across both APIs into a single combined card, instead of two separate lists
- A proper loading animation instead of plain "Loading..." text
- Better layout on mobile screens

## Credits

- Book data from the [Google Books API](https://developers.google.com/books)
- Book data from [Open Library](https://openlibrary.org/developers/api)
- Built with [Express](https://expressjs.com/)

## License

MIT