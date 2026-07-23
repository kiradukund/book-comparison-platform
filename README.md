# Book Comparison Platform

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