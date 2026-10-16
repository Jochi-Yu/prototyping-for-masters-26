import './styles.css';
import { demoBooks } from './demo.js';
import { createVisualizations } from './visualizations.js';
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const databaseUrl = 'https://app.notion.com/p/lalizlabeth/df38e553a9bb8287b35601ef2a9bd015?v=1bb8e553a9bb82d5a6e8082e89dee1f0';
const icons = {
  book: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8c-4-3-9-3-13-2v20c5-1 9-1 13 2 4-3 8-3 13-2V6c-4-1-9-1-13 2Zm0 0v20M7 11l5 1m-5 4 5 1m8-5 5-1m-5 6 5-1"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
};
let books = [], mode = 'loading', genre = 'All books', query = '', sort = 'recent', onlyFavorites = false, lastSync, genreOptions = [], saving = false, loadingShelf = false;
$('#bookshelf').innerHTML = `
  <header class="topbar"><a class="brand" href="/prototypes/my-bookshelf/">${icons.book}<span>My bookshelf</span></a><div class="connection"><span id="connection-status">Opening your shelf…</span><button id="setup-toggle" aria-expanded="false" aria-controls="setup">Notion setup <span aria-hidden="true">↗</span></button></div></header>
  <main>
    <section class="intro"><div><p class="eyebrow">A PERSONAL READING JOURNAL</p><h1>My bookshelf<span class="title-dot">.</span></h1><p class="subtitle">For the books that stay with you.</p></div><div class="intro-note"><span class="note-star" aria-hidden="true">✳</span><p>A few good books.<br>A whole lot of worlds.</p></div></section>
    <section id="setup" class="setup" hidden aria-labelledby="setup-title"><div><p class="eyebrow">YOUR BOOKS, FROM NOTION</p><h2 id="setup-title">Make this shelf yours.</h2><p>Your database is ready to connect. Add a Notion connection with Read content and Insert content access, then keep its token in this project’s private <code>.env.local</code> file.</p><ol><li>Create a connection with <strong>Read content</strong> and <strong>Insert content</strong> access in <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noreferrer">Notion’s connection settings ↗</a>.</li><li>Open <a href="${databaseUrl}" target="_blank" rel="noreferrer">your database ↗</a>, then add the connection under <strong>••• → Connections</strong>.</li><li>Set <code>NOTION_TOKEN</code> in <code>.env.local</code>. The database ID is already filled in. Restart the dev server, then refresh this shelf.</li></ol><p class="small">Expected properties: Title · Author (text) · Genre (select) · Cover Image (files or URL) · Rating (number) · Review (text) · Favorite (checkbox). All rows are treated as books you’ve read.</p></div><button id="setup-close" class="text-button">Close setup ×</button></section>
    <div id="notice" class="notice" role="status" hidden></div>
    <section id="collection" aria-labelledby="collection-title"><div class="collection-heading"><h2 id="collection-title" class="sr-only">Your bookshelf</h2><div class="shelf-tabs" role="tablist" aria-label="Bookshelf views"><button id="collection-tab" role="tab" aria-selected="true" aria-controls="collection-panel">The collection <span id="total" class="count">—</span></button><button id="visualizations-tab" role="tab" aria-selected="false" aria-controls="visualizations-panel" tabindex="-1">Visualizations</button></div><div class="collection-actions"><button id="refresh" class="text-button"><span aria-hidden="true">↻</span> Refresh shelf</button><button id="add-book" class="primary-button" aria-expanded="false" aria-controls="add-book-panel"><span aria-hidden="true">+</span> Add book</button></div></div>
      <section id="add-book-panel" class="add-book-panel" hidden aria-labelledby="add-book-heading">
        <div class="form-intro"><p class="eyebrow">ANOTHER CHAPTER, REMEMBERED</p><h2 id="add-book-heading">Add a book</h2><p>Save a read and a few thoughts to your bookshelf.</p></div>
        <form id="book-form"><fieldset id="book-fields"><legend class="sr-only">Book details</legend><div class="book-form-grid">
          <label for="book-title">Title <span class="required-note">(required)</span><input id="book-title" name="title" required maxlength="2000" placeholder="The book’s title" /></label>
          <label for="book-author">Author <span class="required-note">(required)</span><input id="book-author" name="author" required maxlength="2000" placeholder="Who wrote it?" /></label>
          <label for="book-genre">Genre<input id="book-genre" name="genre" list="book-genre-options" maxlength="100" placeholder="Choose or enter one genre" /><datalist id="book-genre-options"></datalist></label>
          <label for="book-rating">Rating<input id="book-rating" aria-label="Rating" aria-describedby="rating-hint" name="rating" type="number" step="any" placeholder="e.g. 4.5" /><span id="rating-hint" class="field-hint">Leave blank if you haven’t rated it.</span></label>
          <label class="form-wide favorite-field" for="book-favorite"><input id="book-favorite" name="favorite" type="checkbox" /><span>Favorite<span class="field-hint">Keep this book in your favorites.</span></span></label>
          <label class="form-wide" for="book-cover">Cover Image<input id="book-cover" aria-label="Cover Image" name="cover" type="url" maxlength="2000" placeholder="https://example.com/book-cover.jpg" aria-describedby="cover-hint" /><span id="cover-hint" class="field-hint">Paste a publicly accessible image URL. Leave blank for an illustrated cover.</span></label>
          <label class="form-wide" for="book-review">Review<textarea id="book-review" name="review" rows="4" maxlength="10000" placeholder="What stayed with you?"></textarea></label>
        </div><div class="form-actions"><p>Saved directly to your Notion database.</p><button id="cancel-book" type="button" class="secondary-button">Cancel</button><button id="save-book" class="primary-button" type="submit">Save book</button></div></fieldset><p id="save-error" class="save-error" role="alert" tabindex="-1" hidden></p></form>
      </section>
      <p id="save-success" class="save-success" role="status" hidden></p>
      <div id="collection-panel" role="tabpanel" aria-labelledby="collection-tab" tabindex="0"><div class="toolbar"><label class="search">${icons.search}<span class="sr-only">Search books</span><input id="search" type="search" placeholder="Find a title, author, or a thought…" autocomplete="off" /></label><div class="toolbar-actions"><button id="favorites" aria-pressed="false">♡ Favorites</button><label class="sort"><span class="sr-only">Sort books</span><select id="sort"><option value="recent">Recently added</option><option value="title">Title, A–Z</option><option value="author">Author, A–Z</option><option value="rating">Highest rated</option></select></label></div></div>
      <div id="genres" class="genres" role="group" aria-label="Filter by genre"></div><p id="results" class="sr-only" aria-live="polite"></p>
      <div id="gallery" class="gallery" aria-busy="true">${Array.from({length:4}, () => '<div class="skeleton"><div></div><p></p><p></p></div>').join('')}</div></div>
      <div id="visualizations-panel" role="tabpanel" aria-labelledby="visualizations-tab" tabindex="0" hidden></div>
    </section>
    <footer><span>A little home for your reading life.</span><span id="footer-status">Powered by Notion <span aria-hidden="true">↗</span></span></footer>
  </main>`;
const renderVisualizations = createVisualizations($('#visualizations-panel'));
function setView(view, updateHash = true) {
 const visualizations = view === 'visualizations';
 for (const name of ['collection', 'visualizations']) {
   const active = (name === 'visualizations') === visualizations;
   $(`#${name}-tab`).setAttribute('aria-selected', String(active));
   $(`#${name}-tab`).tabIndex = active ? 0 : -1;
   $(`#${name}-panel`).hidden = !active;
 }
 if (updateHash && location.hash !== `#${view}`) history.pushState(null, '', `#${view}`);
}
const tabs = [...document.querySelectorAll('[role="tab"]')];
tabs.forEach((tab, index) => {
 tab.addEventListener('click', () => setView(index === 1 ? 'visualizations' : 'collection'));
 tab.addEventListener('keydown', event => {
   if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
   event.preventDefault();
   const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
   tabs[next].focus(); setView(next === 1 ? 'visualizations' : 'collection');
 });
});
const restoreView = () => setView(location.hash === '#visualizations' ? 'visualizations' : 'collection', false);
window.addEventListener('hashchange', restoreView);
window.addEventListener('popstate', restoreView);
setView(location.hash === '#visualizations' ? 'visualizations' : 'collection', false);
renderVisualizations(books, { mode, ready: false });
const patterns = {
 sun: '<circle cx="100" cy="110" r="54"/><path d="M100 35v150M25 110h150M47 57l106 106M47 163 153 57"/>',
 waves: '<path d="M-10 70q55-35 110 0t110 0M-10 95q55-35 110 0t110 0M-10 120q55-35 110 0t110 0M-10 145q55-35 110 0t110 0M-10 170q55-35 110 0t110 0"/>',
 moon: '<circle cx="100" cy="110" r="57" fill="currentColor" stroke="none"/><circle cx="125" cy="88" r="45" fill="var(--cover-color)" stroke="none"/><path d="M35 46v15m-7-7h14m120 106v15m-7-7h14"/>',
 arches: '<path d="M35 190V88a65 65 0 0 1 130 0v102M55 190V88a45 45 0 0 1 90 0v102M75 190V88a25 25 0 0 1 50 0v102M95 190V88a5 5 0 0 1 10 0v102"/>',
 flower: '<path d="M100 180V95m0 50q-65-5-55-45 50 0 55 45m0-20q65-5 55-45-50 0-55 45"/><circle cx="100" cy="60" r="28"/><circle cx="100" cy="60" r="12"/>',
 path: '<path d="M45 205c170-70-120-90 60-180M75 205c170-70-120-90 60-180M15 205c170-70-120-90 60-180"/>',
 blocks: '<rect x="30" y="35" width="70" height="70" fill="currentColor"/><circle cx="135" cy="70" r="35"/><rect x="100" y="105" width="70" height="70" fill="currentColor"/><circle cx="65" cy="140" r="35"/>',
};
function coverMarkup(book) {
 const fallback = `<div class="cover-design" style="--cover-color:${escape(book.color || '#d5d9c9')};--cover-ink:${escape(book.ink || '#334a3d')}"><span class="cover-author">${escape(book.author)}</span><strong class="cover-title">${escape(book.title)}</strong><svg class="cover-art" viewBox="0 0 200 210" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">${patterns[book.pattern] || patterns.arches}</svg><span class="cover-caption">${mode === 'demo' ? 'THE BOOKSHELF EDITIONS' : 'MY READING JOURNAL'}</span></div>`;
 return `<div class="book-cover">${fallback}${book.cover ? `<img src="${escape(book.cover)}" alt="Cover of ${escape(book.title)}" loading="lazy" referrerpolicy="no-referrer" />` : ''}</div>`;
}
function renderGenres() {
 const names = ['All books', ...new Set(books.map(book => book.genre).sort())];
 if (!names.includes(genre)) genre = 'All books';
 $('#genres').innerHTML = names.map(name => `<button data-genre="${escape(name)}" aria-pressed="${name === genre}">${escape(name)}</button>`).join('');
}
function renderBooks() {
 renderVisualizations(books, { mode });
 const term = query.trim().toLowerCase();
 const filtered = books.filter(book => (genre === 'All books' || book.genre === genre) && (!onlyFavorites || book.favorite === true) && `${book.title} ${book.author} ${book.review}`.toLowerCase().includes(term));
 filtered.sort((a,b) => sort === 'rating' ? (b.rating ?? -Infinity) - (a.rating ?? -Infinity) : sort === 'title' || sort === 'author' ? a[sort].localeCompare(b[sort]) : String(b.added).localeCompare(String(a.added)));
 $('#total').textContent = books.length;
 $('#results').textContent = `${filtered.length} ${filtered.length === 1 ? 'book' : 'books'} shown`;
 $('#gallery').setAttribute('aria-busy', 'false');
 $('#gallery').innerHTML = filtered.length ? filtered.map((book, index) => `<article class="book" style="--order:${index % 8}">
   <div class="cover-stage">${coverMarkup(book)}${book.favorite === true ? '<span class="favorite-badge"><span aria-hidden="true">♥</span> Favorite</span>' : ''}<span class="book-number" aria-hidden="true">${String(books.indexOf(book)+1).padStart(2,'0')}</span></div>
   <div class="book-meta"><span class="genre">${escape(book.genre)}</span><span class="rating" aria-label="${book.rating === null ? 'Not rated' : `Rating: ${book.rating}`}">${book.rating === null ? '<span class="unrated">Not rated</span>' : `<span aria-hidden="true">★</span> ${escape(book.rating)}`}</span></div>
   <h3>${escape(book.title)}</h3><p class="author">${escape(book.author)}</p>
   ${book.review ? `<details class="review"><summary><span class="review-preview">${escape(book.review)}</span><span class="review-label"><span class="read-label">Read my review</span><span class="close-label">Close review</span> <span aria-hidden="true">↗</span></span></summary><p>${escape(book.review)}</p>${book.url ? `<a class="notion-link" href="${escape(book.url)}" target="_blank" rel="noreferrer">Open in Notion ↗</a>` : ''}</details>` : `<p class="no-review">No review yet.</p>${book.url ? `<a class="notion-link" href="${escape(book.url)}" target="_blank" rel="noreferrer">Add a review in Notion ↗</a>` : ''}`}
 </article>`).join('') : `<div class="empty"><span aria-hidden="true">${icons.book}</span><h3>${books.length ? 'No books on this part of the shelf.' : 'Your next chapter starts here.'}</h3><p>${books.length ? 'Try another search or clear your filters.' : 'Use Add book to save your first read to this shelf.'}</p>${books.length ? '<button id="clear-filters">Clear filters</button>' : `<a href="${databaseUrl}" target="_blank" rel="noreferrer">Open your database ↗</a>`}</div>`;
 document.querySelectorAll('.book-cover img').forEach(img => img.addEventListener('error', () => img.remove(), { once:true }));
 $('#clear-filters')?.addEventListener('click', () => { query=''; genre='All books'; onlyFavorites=false; $('#search').value=''; $('#favorites').setAttribute('aria-pressed','false'); renderGenres(); renderBooks(); });
}
function updateGenreOptions() {
 const names = [...new Set([...genreOptions, ...books.map(book => book.genre)])].sort();
 $('#book-genre-options').innerHTML = names.map(name => `<option value="${escape(name)}"></option>`).join('');
}
function toggleBookForm(open) {
 if (saving) return;
 $('#add-book-panel').hidden = !open;
 $('#add-book').setAttribute('aria-expanded', String(open));
 if (open) {
   setView('collection');
   updateGenreOptions();
   $('#save-success').hidden = true;
   $('#book-title').focus();
 } else $('#add-book').focus();
}
$('#add-book').addEventListener('click', () => toggleBookForm($('#add-book-panel').hidden));
$('#cancel-book').addEventListener('click', () => toggleBookForm(false));
$('#book-form').addEventListener('submit', async event => {
 event.preventDefault();
 if (saving || loadingShelf) return;
 const values = Object.fromEntries(new FormData(event.currentTarget));
 values.favorite = $('#book-favorite').checked;
 values.rating = values.rating.trim() === '' ? null : Number(values.rating);
 saving = true;
 $('#book-fields').disabled = true;
 $('#save-book').textContent = 'Saving…';
 $('#save-error').hidden = true;
 $('#refresh').disabled = true;
 try {
   const response = await fetch('/api/bookshelf', {
     method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
   });
   if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The bookshelf server could not confirm the save. Check Notion before trying again.');
   const data = await response.json();
   if (!response.ok) throw new Error(data.error || 'The book could not be saved. Your details are still here.');
   if (!data.book?.id) throw new Error('Notion did not confirm the new book. Check your database before trying again.');
   // Use the confirmed page directly, so an unrelated refresh failure cannot undo a successful save.
   books = [data.book, ...(mode === 'live' ? books.filter(book => book.id !== data.book.id) : [])];
   mode = 'live'; lastSync = new Date().toISOString();
   query = ''; genre = 'All books'; onlyFavorites = false; sort = 'recent';
   $('#search').value = ''; $('#sort').value = 'recent'; $('#favorites').setAttribute('aria-pressed', 'false');
   $('#connection-status').innerHTML = '<span class="status-dot"></span> Connected to Notion';
   $('#notice').hidden = true;
   $('#footer-status').textContent = `Saved at ${new Date(lastSync).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · Powered by Notion`;
   renderGenres(); renderBooks(); updateGenreOptions();
   $('#book-form').reset();
   saving = false; toggleBookForm(false);
   $('#save-success').textContent = `“${data.book.title}” was added to your bookshelf.`;
   $('#save-success').hidden = false;
 } catch (error) {
   $('#save-error').textContent = error instanceof TypeError ? 'The connection was interrupted. Check Notion before trying again to avoid adding the book twice. Your details are still here.' : error.message;
   $('#save-error').hidden = false;
   $('#save-error').focus();
 } finally {
   saving = false; $('#book-fields').disabled = false;
   $('#save-book').textContent = 'Save book'; $('#refresh').disabled = false;
 }
});
function toggleSetup(open) { $('#setup').hidden = !open; $('#setup-toggle').setAttribute('aria-expanded', String(open)); }
$('#setup-toggle').addEventListener('click', () => toggleSetup($('#setup').hidden));
$('#setup-close').addEventListener('click', () => { toggleSetup(false); $('#setup-toggle').focus(); });
$('#search').addEventListener('input', e => { query=e.target.value; renderBooks(); });
$('#sort').addEventListener('change', e => { sort=e.target.value; renderBooks(); });
$('#favorites').addEventListener('click', () => { onlyFavorites=!onlyFavorites; $('#favorites').setAttribute('aria-pressed', String(onlyFavorites)); renderBooks(); });
$('#favorites').title = 'Books checked as Favorite in Notion';
$('#genres').addEventListener('click', e => { const button=e.target.closest('button'); if (button) { genre=button.dataset.genre; document.querySelectorAll('[data-genre]').forEach(item => item.setAttribute('aria-pressed',String(item === button))); renderBooks(); } });
async function load() {
 if (saving || loadingShelf) return;
 loadingShelf = true;
 $('#save-book').disabled = true;
 $('#add-book').disabled = true;
 $('#refresh').disabled=true; $('#refresh').textContent='Refreshing…';
 $('#gallery').setAttribute('aria-busy','true');
 try {
   const response = await fetch('/api/bookshelf', { cache:'no-store' });
   if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The bookshelf server is not running. Start this project with npm run dev to connect to Notion.');
   const data = await response.json();
   if (!response.ok) throw new Error(data.error || 'Your shelf could not be loaded. Try refreshing.');
   genreOptions=data.genres ?? []; updateGenreOptions();
   mode=data.mode; books = mode === 'demo' ? demoBooks : data.books; lastSync=data.syncedAt;
   $('#connection-status').innerHTML=mode === 'demo' ? '<span class="status-dot demo"></span> Sample shelf' : '<span class="status-dot"></span> Connected to Notion';
   $('#notice').hidden = mode !== 'demo' && !data.warning;
   $('#notice').innerHTML = mode === 'demo' ? '<span>You’re browsing a sample shelf. Connect Notion to see your own books.</span><button id="connect">Connect your bookshelf <span aria-hidden="true">↗</span></button>' : escape(data.warning || '');
   $('#connect')?.addEventListener('click', () => { toggleSetup(true); $('#setup').scrollIntoView({behavior:'smooth',block:'start'}); });
   $('#footer-status').textContent=mode === 'demo' ? 'Sample books · Powered by Notion' : `Synced at ${new Date(lastSync).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · Powered by Notion`;
   renderGenres(); renderBooks();
 } catch(error) {
   $('#notice').hidden=false; $('#notice').textContent=error.message;
   $('#connection-status').textContent='Connection needs attention';
   if (mode === 'loading') { $('#gallery').innerHTML='<div class="empty"><h3>Your shelf is waiting.</h3><p>Check the connection message above, then refresh to try again.</p></div>'; $('#total').textContent='—'; }
   else $('#footer-status').textContent='Showing the last loaded shelf · Refresh to retry';
 } finally { loadingShelf = false; $('#save-book').disabled = false; $('#add-book').disabled=false; $('#refresh').disabled=false; $('#refresh').innerHTML='<span aria-hidden="true">↻</span> Refresh shelf'; $('#gallery').setAttribute('aria-busy','false'); }
}
$('#refresh').addEventListener('click', load);
// Refresh signed cover URLs when the tab is revisited after 30 minutes.
document.addEventListener('visibilitychange', () => { if (!document.hidden && mode === 'live' && Date.now()-new Date(lastSync).getTime()>1800000 && !$('#refresh').disabled) load(); });
load();
