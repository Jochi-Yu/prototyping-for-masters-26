# My bookshelf

A standalone reading journal at `/prototypes/my-bookshelf/`. The course homepage remains at `/`.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open the printed local address followed by `/prototypes/my-bookshelf/`.

The initial shelf contains eight **fictional sample books, sample reviews, and original illustrative covers**. A sample label remains visible until a live Notion query succeeds. Live failures show an error and retain only the last successfully loaded shelf; they never silently substitute sample data.

## Connect your database

Your database: [My bookshelf in Notion](https://app.notion.com/p/lalizlabeth/df38e553a9bb8287b35601ef2a9bd015?v=1bb8e553a9bb82d5a6e8082e89dee1f0).

1. Create an internal Notion connection with **Read content** and **Insert content** capabilities in [Notion connection settings](https://www.notion.so/profile/integrations).
2. In the database’s **••• → Connections** menu, add that connection.
3. Add the private token to `NOTION_TOKEN` in the existing, ignored `.env.local`. The database ID has been filled in locally. For a fresh checkout, copy `.env.example` to `.env.local` and fill both fields:

   ```dotenv
   NOTION_TOKEN=your_private_connection_token
   NOTION_DATABASE_ID=df38e553a9bb8287b35601ef2a9bd015
   NOTION_DATA_SOURCE_ID=
   ```

4. Restart the dev server and click **Refresh shelf**.

Do not paste tokens into chat, put them in frontend code, or prefix them with `VITE_`. The API token stays on the server. The **Add book** form creates a page in your Notion database. Existing books and reviews can be edited in Notion, then refreshed here. Enable **Update content** as well if you want to create new Genre options from the form; existing genre options need no schema change.

If the database contains multiple data sources, set `NOTION_DATA_SOURCE_ID` to the intended table’s ID. The app intentionally does not pick an arbitrary table.

## Add a book

Click **Add book** above the gallery. The inline form includes all seven properties: title, author, a single genre with suggestions from Notion, cover image URL, numeric rating, review, and a Favorite checkbox. Title and author are required; other fields may be left blank. Covers are entered as public image URLs (file uploads are not part of this form).

**Save book** sends a same-origin JSON request to the private server, which validates the fields and calls Notion’s [Create page endpoint](https://developers.notion.com/reference/post-page) using a data-source parent. It maps the cover URL to either a URL property or an external file, according to the database schema. Reviews up to 10,000 characters are split into Notion-compatible rich-text chunks. Numbers preserve zero and fractional ratings.

The button is disabled during saving. On confirmed success, the new book appears immediately, active filters are cleared to make it visible, and the form resets. Failures preserve the form with an actionable error. Cancel collapses the form and keeps the draft until the page reloads. Missing credentials never create pretend saved books. An interrupted save asks you to check Notion before retrying, because a network error cannot prove that Notion did not create the page.

## Properties

| Exact property name | Notion type | Display |
| --- | --- | --- |
| Title | Title | Book title |
| Author | Text (rich text) | Author name |
| Genre | Select | Genre label and filter |
| Cover Image | Files & media or URL | First attached file or image URL; illustrated fallback if absent or broken |
| Rating | Number | Exact numeric value, including zero and fractions; blank means not rated |
| Review | Text (rich text) | Preview plus expandable full review |
| Favorite | Checkbox | Favorite badge, filter, and visualization count |

Every active row is treated as a completed read because the supplied schema has no reading-status property. Trashed and archived pages are excluded. Favorites uses the **Favorite checkbox in Notion**, independently of rating. Checked books display a Favorite badge; the Add book form saves the checkbox with the new entry. Existing favorite changes in Notion appear after Refresh shelf. Numeric ratings are shown without clamping or rounding. “Recently added” uses Notion page creation time, not a completion date.

Search matches title, author, and review. Genre, favorites, and search combine. Sorting supports recently added, title, author, and rating. Filtering happens after all query pages load.

## API implementation and documentation

Checked against official Notion documentation on October 16, 2026:

- [Versioning](https://developers.notion.com/reference/versioning): explicitly sends `Notion-Version: 2026-03-11`.
- [2026-03-11 upgrade guide](https://developers.notion.com/guides/get-started/upgrade-guide-2026-03-11): uses current field conventions.
- [Retrieve a database](https://developers.notion.com/reference/retrieve-a-database): resolves the container’s data source when only a database ID is supplied.
- [Query a data source](https://developers.notion.com/reference/query-a-data-source): calls `POST /v1/data_sources/{id}/query` and follows opaque cursors through every page; surfaces a warning if Notion marks the 10,000-result query limit as incomplete.
- [Page property values](https://developers.notion.com/reference/page-property-values): maps title, rich text, select, number, files, and URL properties.
- [Authorization](https://developers.notion.com/guides/get-started/authorization): server-side bearer token and explicit database access.

Native server-side `fetch` avoids relying on an SDK’s implicit version. The server validates property types, retries rate limits with `Retry-After`, uses request timeouts, and returns actionable errors without echoing credentials. Responses use `Cache-Control: no-store`. Refresh retrieves fresh signed cover URLs; returning to a tab after 30 minutes also refreshes live data. Expired or unavailable images retain a title-based cover fallback.

The prototype’s backend is a Vite dev/preview middleware at `/api/bookshelf`. `npm run build` includes both pages, and `npm run preview` serves the API with the same private environment configuration. **A static-only deployment cannot query Notion**: a deployed version needs a server/serverless route using `bookshelfMiddleware` or `createBookshelfService`. This personal local prototype has no user authentication; add access control before exposing a private bookshelf publicly.

## Verification

```sh
npm run build
node --test tests/unit/*.test.mjs
npm test
```

Tests cover Notion pagination, version headers, data-source selection, schema validation, rate limits, normalization, escaped content, failed covers, sample/live/empty/error states, search, filters, sorting, reviews, mobile overflow, create-page payloads, submission validation, save failures, double-click protection, and same-origin write protection. A real Notion request requires your private token and database permissions.

## Reading visualizations

The **Visualizations** tab (`/prototypes/my-bookshelf/#visualizations`) summarizes the entire loaded collection, independently of gallery search and filters. It includes genre shares, counts at each exact rating, average rating by genre with sample sizes, author counts, review coverage, and the number of favorites. Select a chart entry to inspect the corresponding books below the charts. Authors with tied counts are ordered alphabetically; the full list can be expanded.

Blank ratings are excluded from averages and shown separately in the distribution; zero and fractional ratings are included. Missing genres appear as Uncategorized. Unknown authors are excluded from author rankings. Sample shelves are labeled, and empty shelves show an invitation to add a book. Charts update after refresh and successful book creation.

These are collection-wide patterns, not time trends. Notion page creation time is not treated as the date a book was read. Monthly or annual reading charts would require a date-read property.
