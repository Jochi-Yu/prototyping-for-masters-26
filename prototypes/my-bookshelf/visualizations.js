const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
const plural = count => `${count} ${count === 1 ? 'book' : 'books'}`;
const rated = book => typeof book.rating === 'number' && Number.isFinite(book.rating);
const colors = ['#53613d', '#ae724f', '#66858d', '#ab9454', '#8a7487', '#738265', '#a16a71', '#7c827d'];

export function summarizeBooks(books) {
  const genres = new Map(), authors = new Map(), ratings = new Map();
  let ratingTotal = 0, ratedCount = 0, reviewedCount = 0;
  for (const book of books) {
    const genre = book.genre?.trim() || 'Uncategorized';
    if (!genres.has(genre)) genres.set(genre, { name: genre, count: 0, ratedCount: 0, ratingTotal: 0 });
    const group = genres.get(genre);
    group.count++;
    const author = book.author?.trim();
    if (author && author !== 'Unknown author') authors.set(author, (authors.get(author) || 0) + 1);
    const ratingKey = rated(book) ? book.rating : null;
    ratings.set(ratingKey, (ratings.get(ratingKey) || 0) + 1);
    if (rated(book)) {
      ratedCount++; ratingTotal += book.rating;
      group.ratedCount++; group.ratingTotal += book.rating;
    }
    if (book.review?.trim()) reviewedCount++;
  }
  const byCount = (a, b) => b.count - a.count || a.name.localeCompare(b.name);
  return {
    total: books.length, ratedCount, reviewedCount, favoriteCount: books.filter(book => book.favorite === true).length,
    average: ratedCount ? ratingTotal / ratedCount : null,
    genres: [...genres.values()].map(g => ({ ...g, average: g.ratedCount ? g.ratingTotal / g.ratedCount : null })).sort(byCount),
    authors: [...authors].map(([name, count]) => ({ name, count })).sort(byCount),
    ratings: [...ratings].map(([value, count]) => ({ value, count })).sort((a,b) => a.value === null ? 1 : b.value === null ? -1 : a.value - b.value),
  };
}

export function createVisualizations(root) {
  let books = [], summary, selected = null, showAllAuthors = false;
  const disclosure = () => {
    const detail = root.querySelector('.chart-detail');
    if (!detail) return;
    root.querySelectorAll('[data-chart]').forEach(button => button.setAttribute('aria-pressed', String(selected?.kind === button.dataset.chart && selected?.index === Number(button.dataset.index))));
    if (!selected) { detail.hidden = true; return; }
    const { kind, index } = selected;
    const group = summary[kind][index];
    const matches = books.filter(book => kind === 'genres' ? (book.genre?.trim() || 'Uncategorized') === group.name : kind === 'authors' ? book.author?.trim() === group.name : (rated(book) ? book.rating : null) === group.value);
    const label = kind === 'ratings' ? group.value === null ? 'Not rated yet' : `Rated ${number(group.value)}` : group.name;
    detail.hidden = false;
    detail.innerHTML = `<div class="detail-heading"><div><p class="eyebrow">BEHIND THE NUMBERS</p><h3>${escape(label)} <span>${plural(matches.length)}</span></h3></div><button type="button" class="text-button" data-clear>Clear selection ×</button></div><ul class="insight-books">${matches.map(book => `<li><div><strong>${escape(book.title)}</strong><span>${escape(book.author)}</span></div><span>${rated(book) ? `★ ${number(book.rating)}` : 'Not rated'}</span></li>`).join('')}</ul>`;
    root.querySelector('.chart-announcement').textContent = `${label}: ${plural(matches.length)}. Book details are below the charts.`;
  };
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-clear')) {
      const previous = selected;
      selected = null; disclosure();
      root.querySelector(`[data-chart="${previous.kind}"][data-index="${previous.index}"]`)?.focus();
      root.querySelector('.chart-announcement').textContent = 'Selection cleared.';
    } else if (button.dataset.chart) {
      const next = { kind: button.dataset.chart, index: Number(button.dataset.index) };
      selected = selected?.kind === next.kind && selected?.index === next.index ? null : next;
      disclosure();
      if (selected) root.querySelector('.chart-detail').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    } else if (button.hasAttribute('data-authors-toggle')) {
      showAllAuthors = !showAllAuthors;
      root.querySelectorAll('.additional-author').forEach(row => { row.hidden = !showAllAuthors; });
      button.setAttribute('aria-expanded', String(showAllAuthors));
      button.textContent = showAllAuthors ? 'Show fewer authors' : `Show all ${summary.authors.length} authors`;
    }
  });
  return function render(nextBooks, { mode, ready = true } = {}) {
    books = nextBooks; summary = summarizeBooks(books); selected = null;
    if (!ready) {
      root.innerHTML = '<div class="empty"><h3>Your reading portrait is on its way.</h3><p>Load your bookshelf to explore your reading patterns.</p></div>';
      return;
    }
    if (!books.length) {
      root.innerHTML = '<div class="empty"><h3>A reading portrait, waiting to happen.</h3><p>Add your first book to start seeing your genres, ratings, and authors here.</p></div>';
      return;
    }
    const leading = summary.genres.filter(g => g.count === summary.genres[0].count);
    const genreInsight = leading.length === 1 ? `<em>${escape(leading[0].name)}</em> takes up the most room on your shelf.` : 'Your shelf has a little room for everything.';
    const ratingMax = Math.max(...summary.ratings.map(g => g.count));
    const authorMax = summary.authors[0]?.count || 1;
    const allAuthorsEqual = summary.authors.length > 1 && summary.authors.every(a => a.count === summary.authors[0].count);
    const genreRatings = summary.genres.map((g, index) => ({...g, index})).sort((a,b) => (b.average ?? -Infinity) - (a.average ?? -Infinity) || a.name.localeCompare(b.name));
    root.innerHTML = `
      <div class="insights-intro"><div><p class="eyebrow">YOUR READING, IN PERSPECTIVE</p><h2>A portrait of your shelf.</h2><p>${genreInsight}</p></div><p class="insights-scope">${mode === 'demo' ? 'Sample books' : 'Entire collection'}<br>Gallery filters don’t affect these charts.</p></div>
      <dl class="reading-summary"><div><dt>Books read</dt><dd data-stat="total">${summary.total}</dd></div><div><dt>Genres explored</dt><dd data-stat="genres">${summary.genres.filter(g=>g.name!=='Uncategorized').length}</dd></div><div><dt>Average rating</dt><dd data-stat="average">${summary.average === null ? '—' : number(summary.average)} <span>${summary.ratedCount} rated</span></dd></div><div><dt>Favorite books</dt><dd data-stat="favorites">${summary.favoriteCount}</dd></div><div><dt>Thoughts captured</dt><dd data-stat="reviewed">${summary.reviewedCount}<span>of ${summary.total} reviewed</span></dd></div></dl>
      <p class="chart-instruction">Select a genre, rating, or author to see the books behind it.</p>
      <div class="insight-grid">
        <section class="insight-chart" aria-labelledby="genres-chart-title"><div class="chart-heading"><p class="eyebrow">01 / THE WORLDS YOU VISIT</p><h3 id="genres-chart-title">Your genre mix</h3><p>Share of all ${plural(summary.total)}.</p></div>
          <ul class="genre-bars">${summary.genres.map((g,i) => `<li><button data-chart="genres" data-index="${i}" aria-pressed="false" aria-controls="chart-detail"><span class="bar-label">${escape(g.name)}<span>${plural(g.count)} · ${Math.round(g.count / summary.total * 100)}%</span></span><span class="bar-track" aria-hidden="true"><span style="width:${g.count / summary.total * 100}%;background:${colors[i % colors.length]}"></span></span></button></li>`).join('')}</ul>
        </section>
        <section class="insight-chart" aria-labelledby="ratings-chart-title"><div class="chart-heading"><p class="eyebrow">02 / HOW THEY LANDED</p><h3 id="ratings-chart-title">The ratings you give</h3><p>${summary.ratedCount ? `${plural(summary.ratedCount)} rated; ${plural(summary.total-summary.ratedCount)} not rated.` : 'Rate a book to start seeing your preferences.'}</p></div>
          <div class="rating-columns" role="group" aria-label="Books by rating">${summary.ratings.map((g,i) => `<button data-chart="ratings" data-index="${i}" aria-pressed="false" aria-controls="chart-detail" aria-label="${g.value === null ? 'Not rated' : `Rating ${number(g.value)}`}: ${plural(g.count)}"><span class="column-count">${g.count}</span><span class="column-track" aria-hidden="true"><span style="height:${g.count/ratingMax*100}%" class="${g.value === null ? 'unrated-column' : ''}"></span></span><span class="column-label">${g.value === null ? 'Not rated' : `${number(g.value)} ★`}</span></button>`).join('')}</div><p class="chart-footnote">Exact ratings, including fractions. Unrated books are excluded from averages.</p>
        </section>
        <section class="insight-chart" aria-labelledby="genre-rating-title"><div class="chart-heading"><p class="eyebrow">03 / WHAT RESONATES</p><h3 id="genre-rating-title">Which genres do you love?</h3><p>Average rating by genre. A small sample can tell a different story.</p></div>
          <table class="genre-rating-table"><thead><tr><th scope="col">Genre</th><th scope="col">Rated books</th><th scope="col">Average</th></tr></thead><tbody>${genreRatings.map(g => `<tr><th scope="row"><button data-chart="genres" data-index="${g.index}" aria-pressed="false" aria-controls="chart-detail">${escape(g.name)} <span aria-hidden="true">↗</span></button></th><td>${g.ratedCount}</td><td>${g.average === null ? '—' : number(g.average)}</td></tr>`).join('')}</tbody></table>
        </section>
        <section class="insight-chart" aria-labelledby="authors-chart-title"><div class="chart-heading"><p class="eyebrow">04 / FAMILIAR VOICES</p><h3 id="authors-chart-title">Authors on your shelf</h3><p>${allAuthorsEqual ? `All ${summary.authors.length} authors are tied at ${plural(authorMax)} each.` : 'Most-read authors first; ties listed alphabetically.'}</p></div>
          ${summary.authors.length ? `<ol class="author-bars">${summary.authors.map((a,i) => `<li class="${i>=5 ? 'additional-author' : ''}" ${i>=5 && !showAllAuthors ? 'hidden' : ''}><button data-chart="authors" data-index="${i}" aria-pressed="false" aria-controls="chart-detail"><span class="author-chart-name">${escape(a.name)}</span><span class="author-track" aria-hidden="true"><span style="width:${a.count/authorMax*100}%"></span></span><span>${plural(a.count)}</span></button></li>`).join('')}</ol>${summary.authors.length>5 ? `<button class="text-button" data-authors-toggle aria-expanded="${showAllAuthors}">${showAllAuthors ? 'Show fewer authors' : `Show all ${summary.authors.length} authors`}</button>` : ''}` : '<p class="chart-footnote">Add author names to your books to see this chart.</p>'}
        </section>
      </div>
      <p class="chart-announcement sr-only" aria-live="polite"></p><section id="chart-detail" class="chart-detail" hidden aria-label="Books behind the selection"></section>
      <p class="reading-date-note">Want to see your reading over time? A date-read property would let you track monthly reads. This shelf currently records titles, authors, genres, covers, ratings, reviews, and favorites.</p>`;
  };
}
