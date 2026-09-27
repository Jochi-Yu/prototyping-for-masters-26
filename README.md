# Prototyping for Masters

A simple course homepage built with Vite. Headings use Faculty Glyphic and body copy uses IBM Plex Mono.

## Add student sites

Edit `src/students.js`. Replace each placeholder name and add its full URL:

```js
{ name: "Student Name", url: "https://student-site.com" }
```

Rows without a URL display “Site forthcoming.” Add or remove rows as needed; the live and forthcoming counts update automatically.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.
