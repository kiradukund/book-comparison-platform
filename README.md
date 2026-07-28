# Book Comparison Platform

**Live site:** https://www.kiralekund.tech
**Demo video:** https://drive.google.com/file/d/18wc_PAmtUj3GgyZARpA8ZSTZnxwYwjFa/view?usp=sharing

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

Search results from both APIs, live on kiralekund.tech:

![Search results](public/screenshots/search-results.png)

Sorted by page count:

![Sort by page count](public/screenshots/sort-by-pages.png)

Live filter narrowing results as you type:

![Live filter](public/screenshots/live-filter.png)

## Technologies Used

I used plain HTML, CSS, and JavaScript for the frontend instead of a framework like React because the assignment didn't need anything that complicated, and I wanted to actually understand every part of what I was writing instead of relying on a framework to handle things for me.

For the backend I used Node.js with Express. Express made it simple to set up routes that talk to the external APIs without exposing my API key to anyone looking at the frontend code.

## APIs Used

**Google Books API**
- Purpose: main source of book data — titles, authors, page counts, cover images
- Docs: https://developers.google.com/books
- Needs an API key: yes
- What it gives: title, authors, publisher, page count, cover image, categories

**Open Library API**
- Purpose: second source, mainly used to compare edition counts and check different language versions
- Docs: https://openlibrary.org/developers/api
- Needs an API key: no
- What it gives: title, authors, edition count, first publish year, language, cover image

I picked these two because they're both free and don't need payment info to get an API key, which mattered since this is a school project and not something I'm running long term.

## Project Structure

book-comparison-platform/
├── server.js          → Express server, routes for both APIs, retry logic
├── package.json
├── .env                → holds my Google Books API key (not committed)
├── .gitignore
├── LICENSE
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

## API Key (for grading access)

GOOGLE_BOOKS_API_KEY=AIzaSyA7pnCTYHTlqWKqSGSvy_yPMTblTcFfPPo

This key is restricted to only the Google Books API in Google Cloud Console, so it can't be used for anything beyond searching books. It's included here for grading access, separate from the Environment Variables section above, which explains how the app would normally be run with your own key.

## Deployment

The app is deployed on two AWS servers, Web01 and Web02, sitting behind a load balancer (HAProxy) that I set up earlier in my DevOps coursework. The domain is kiralekund.tech.

On each server I installed Node.js 20 and git, cloned the repo from GitHub, ran `npm install`, and created a `.env` file directly on the server with my Google Books API key (it's gitignored so it never comes through GitHub, has to be added manually on each machine).

The app itself runs on port 3000 on both servers, but that port isn't open to the outside world, and it shouldn't be — only ports 80 and 443 are open. So I set up Nginx as a reverse proxy on both Web01 and Web02, listening on port 80 and quietly forwarding requests to the Node app on port 3000. This matches what the load balancer expects, since HAProxy was already configured to send traffic to each server on port 80.

To keep the app running permanently instead of just while a terminal window is open, I used pm2 to run it as a background process, and set it up to auto-restart if either server ever reboots.

To test that the load balancer actually distributes traffic instead of just hitting one server, I checked HAProxy's logs directly on the load balancer:

sudo journalctl -u haproxy --no-pager | tail -20

The output showed requests alternating between the two backends, for example:

...https_front~ http_back/7084-web-01 0/0/0/2/2 200 806 ... "GET / HTTP/1.1"
...https_front~ http_back/7084-web-02 1/0/0/2/3 200 5667 ... "GET /script.js HTTP/1.1"
...https_front~ http_back/7084-web-01 0/0/0/2/2 200 1344 ... "GET /style.css HTTP/1.1"
...https_front~ http_back/7084-web-02 0/0/0/2/2 404 413 ... "GET /favicon.ico HTTP/1.1"

Each line switches between web-01 and web-02, which confirms it's round-robin balancing between both servers rather than favoring one. The 404 lines are just the browser automatically requesting a favicon that doesn't exist, unrelated to the app itself.

## Challenges

Reading Google Books' documentation took longer than I expected because the response structure is pretty deep — book info is nested a few levels in, and not every book has every field. Some books don't have a cover image or a page count at all, so I had to add checks for that instead of assuming the data would always be there.

The two APIs also don't agree on much. Google Books gives page counts, Open Library gives edition counts instead, so I couldn't just show the same fields for both — I had to design the sort and filter options separately for each section.

The most annoying problem was that Google's Books API kept returning random 503 errors, completely unrelated to anything in my own code. I confirmed this by hitting the API directly in the browser and getting the same error, so it wasn't a bug on my end. I ended up adding retry logic with increasing wait times between attempts, and a clear fallback message if it still fails after a few tries, so the app doesn't just break or show a blank page when that happens.

Deployment had its own separate problems. Neither Web01 nor Web02 had git or Node installed by default, so I had to install both manually before I could even clone the repo. Neither server had nano or vim either, so instead of using a text editor to write config files, I used echo and cat with heredocs directly in the terminal to create the .env file and rewrite the Nginx config. I also assumed Nginx read from sites-available/default, but it turned out this server's actual active config was sites-enabled/default as a regular file, not a symlink like I expected — editing the wrong file meant my changes weren't doing anything until I found that out.

## Lessons Learned

External APIs aren't something you fully control, even the well-documented ones — Google's Books API returned 503 errors on and off throughout building this, for no reason connected to my code, so error handling wasn't optional, it was necessary for the app to actually be usable.

Combining two APIs means writing separate logic for each one instead of forcing them into one shared format — Google Books and Open Library don't return the same fields, so the sort and filter options had to be built separately per section rather than shared.

On the deployment side, I learned not to assume a server's configuration matches what tutorials expect — checking sites-enabled versus sites-available directly with ls saved me from editing a file that Nginx wasn't even reading. I also learned to keep git commits local until I'm ready to push, so the commit history reflects when work actually happened rather than one large dump at the end.

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

MIT — see the LICENSE file in this repo.

## Author

IRADUKUNDA CYUSA Kevin
k.iradukund@alustudent.com
Software Engineering student at ALU