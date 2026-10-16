export const NOTION_VERSION = '2026-03-11';
const richText = (value = []) => value.map(item => item.plain_text ?? item.text?.content ?? '').join('');
export const safeUrl = value => {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
};
export function normalizeBook(page) {
  const p = page.properties ?? {};
  const cover = p['Cover Image'];
  const file = cover?.files?.[0];
  return {
    id: page.id, title: richText(p.Title?.title) || 'Untitled book',
    author: richText(p.Author?.rich_text) || 'Unknown author',
    genre: p.Genre?.select?.name || 'Uncategorized',
    cover: safeUrl(cover?.url ?? file?.file?.url ?? file?.external?.url),
    rating: typeof p.Rating?.number === 'number' ? p.Rating.number : null,
    favorite: p.Favorite?.checkbox === true,
    review: richText(p.Review?.rich_text), url: safeUrl(page.url),
    added: page.created_time,
  };
}
function inputError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
export function validateBook(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw inputError('Enter the book details.');
  const book = {};
  for (const [key, limit] of Object.entries({ title: 2000, author: 2000, genre: 100, cover: 2000, review: 10000 })) {
    if (input[key] != null && typeof input[key] !== 'string') throw inputError(`Invalid ${key}.`);
    book[key] = (input[key] ?? '').trim();
    if (book[key].length > limit) throw inputError(`${key} must be ${limit.toLocaleString()} characters or fewer.`);
  }
  if (!book.title || !book.author) throw inputError('Enter a title and author.');
  if (book.genre.includes(',')) throw inputError('Choose one genre without commas.');
  if (book.cover && !safeUrl(book.cover)) throw inputError('Enter a full http:// or https:// cover image URL.');
  if (input.rating !== null && input.rating !== undefined && (typeof input.rating !== 'number' || !Number.isFinite(input.rating))) throw inputError('Enter a valid number for the rating, or leave it blank.');
  if (input.favorite !== undefined && typeof input.favorite !== 'boolean') throw inputError('Favorite must be checked or unchecked.');
  book.favorite = input.favorite ?? false;
  book.rating = input.rating ?? null;
  return book;
}
const writeText = value => {
  const parts = [];
  for (let start = 0; start < value.length;) {
    let end = Math.min(start + 2000, value.length);
    if (end < value.length && /[\uD800-\uDBFF]/.test(value[end - 1])) end--;
    parts.push({ type: 'text', text: { content: value.slice(start, end) } });
    start = end;
  }
  return parts;
};
export function createBookshelfService(env, fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  const token = env.NOTION_TOKEN;
  const databaseId = env.NOTION_DATABASE_ID;
  const sourceId = env.NOTION_DATA_SOURCE_ID;
  async function request(path, body) {
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetcher(`https://api.notion.com/v1${path}`, {
          method: body ? 'POST' : 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
          ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
        });
      } catch { throw new Error(path === '/pages' ? 'Notion did not confirm the save. Check your database before trying again to avoid adding the book twice. Your form has been kept.' : 'Notion could not be reached. Check your connection and try refreshing.'); }
      if (response.status === 429 && attempt < 2) {
        const seconds = Number(response.headers.get('retry-after') || 1);
        if (!Number.isFinite(seconds) || seconds > 30) throw new Error('Notion is busy. Please try refreshing in a minute.');
        await sleep(Math.max(1, seconds) * 1000); continue;
      }
      if (!response.ok) {
        const messages = {
          401: 'The Notion token is invalid or expired. Update NOTION_TOKEN in .env.local and restart the server.',
          403: path === '/pages' ? 'Enable Insert content for your Notion connection and give it access to this database, then try again.' : 'This Notion connection needs Read content access to your database.',
          400: 'Notion could not accept these book details. Choose an existing genre, or enable Update content to create a new genre.',
          404: 'Database or data source not found. Check its ID and add your connection in the database’s Connections menu.',
          429: 'Notion is busy. Please try refreshing in a minute.',
        };
        throw new Error(messages[response.status] || (path === '/pages' ? 'Notion did not confirm the save. Check your database before trying again to avoid adding the book twice.' : `Notion could not load your books (HTTP ${response.status}). Check the database setup and retry.`));
      }
      return response.json();
    }
  }
  const configured = Boolean(token && (databaseId || sourceId));
  async function resolveSchema() {
    if (!configured) throw inputError('Connect your Notion database before saving a book. Your details will stay in this form.', 503);
    const validId = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if ((databaseId && !validId.test(databaseId)) || (sourceId && !validId.test(sourceId))) throw new Error('Use a database or data source UUID in .env.local, rather than the full Notion URL.');
    let id = sourceId;
    if (!id) {
      const db = await request(`/databases/${databaseId}`);
      if (db.data_sources?.length !== 1) throw new Error('This database has multiple or no data sources. Set NOTION_DATA_SOURCE_ID to the book table’s data source ID.');
      id = db.data_sources[0].id;
    }
    const schema = await request(`/data_sources/${id}`);
    const expected = { Title: ['title'], Author: ['rich_text'], Genre: ['select'], 'Cover Image': ['files', 'url'], Rating: ['number'], Review: ['rich_text'], Favorite: ['checkbox'] };
    const invalid = Object.entries(expected).filter(([name, types]) => !types.includes(schema.properties?.[name]?.type));
    if (invalid.length) throw new Error(`Check these Notion properties: ${invalid.map(([name, types]) => `${name} (${types.join(' or ')})`).join(', ')}.`);
    return { id, schema };
  }
  async function loadBooks() {
    if (!configured) return { mode: 'demo', books: [], genres: [], reason: 'not_configured' };
    const { id, schema } = await resolveSchema();
    const books = [];
    let cursor; let incomplete = false;
    do {
      const data = await request(`/data_sources/${id}/query`, { page_size: 100, sorts: [{ timestamp: 'created_time', direction: 'descending' }], ...(cursor ? { start_cursor: cursor } : {}) });
      for (const page of data.results) if (page.object === 'page' && !page.in_trash && !page.is_archived) books.push(normalizeBook(page));
      incomplete ||= data.request_status?.type === 'incomplete';
      if (data.has_more && (!data.next_cursor || data.next_cursor === cursor)) throw new Error('Notion returned an invalid continuation. Please try refreshing.');
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    return { mode: 'live', books, genres: (schema.properties.Genre.select?.options ?? []).map(option => option.name), syncedAt: new Date().toISOString(), warning: incomplete ? 'Notion limited this query to 10,000 books. Some books may be missing.' : null };
  }
  loadBooks.addBook = async input => {
    const book = validateBook(input);
    const { id, schema } = await resolveSchema();
    const properties = {
      Title: { title: writeText(book.title) },
      Author: { rich_text: writeText(book.author) },
      Genre: { select: book.genre ? { name: book.genre } : null },
      Rating: { number: book.rating },
      Favorite: { checkbox: book.favorite },
      Review: { rich_text: writeText(book.review) },
      'Cover Image': schema.properties['Cover Image'].type === 'url'
        ? { url: book.cover || null }
        : { files: book.cover ? [{ name: 'Book cover', type: 'external', external: { url: book.cover } }] : [] },
    };
    const page = await request('/pages', { parent: { type: 'data_source_id', data_source_id: id }, properties });
    return { book: normalizeBook(page) };
  };
  return loadBooks;
}
export function bookshelfMiddleware(env) {
  const load = createBookshelfService(env);
  // Coalesce simultaneous reads; no persistent cache of expiring Notion cover URLs.
  let pending;
  return async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/bookshelf') return next();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'POST'].includes(req.method)) { res.statusCode = 405; res.setHeader('Allow', 'GET, POST'); return res.end(JSON.stringify({ error: 'Method not allowed' })); }
    try {
      if (req.method === 'POST') {
        // The local app may write; unrelated websites may not use its private token.
        const origin = req.headers.origin;
        if ((origin && ![`http://${req.headers.host}`, `https://${req.headers.host}`].includes(origin)) || req.headers['sec-fetch-site'] === 'cross-site') throw inputError('This request must come from your bookshelf website.', 403);
        if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw inputError('Send book details as JSON.', 415);
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk);
          if (size > 65536) throw inputError('These book details are too long.', 413);
          chunks.push(Buffer.from(chunk));
        }
        let input;
        try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { throw inputError('The book details could not be read. Please try again.'); }
        const result = await load.addBook(input);
        pending = null;
        res.statusCode = 201;
        return res.end(JSON.stringify(result));
      }
      pending ??= load().finally(() => { pending = null; });
      res.end(JSON.stringify(await pending));
    } catch (error) { res.statusCode = error.status || 502; res.end(JSON.stringify({ error: error.message })); }
  };
}
