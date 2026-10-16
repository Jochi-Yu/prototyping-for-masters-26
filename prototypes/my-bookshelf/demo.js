// Fictional books and original illustrative covers, used only in the labeled demo.
const samples = [
  ['The art of noticing', 'Clara Wren', 'Essays', 5, 'A lovely reminder that paying attention is its own kind of practice. I kept coming back to the small observations: a windowsill, a familiar walk, the way light changes a room.', '#b6c0a4', '#243b2f', 'sun'],
  ['A house by the sea', 'Eleanor Moss', 'Fiction', 4, 'Slow, salt-soaked, and full of people who feel real. The setting stayed with me long after the last page. A book for a rainy afternoon.', '#acc6d3', '#254a65', 'waves'],
  ['Small hours', 'June Park', 'Poetry', 5, 'Little poems with so much room inside them. I read this in one sitting, then started again. The ordinary becomes quietly extraordinary.', '#e6b94e', '#593423', 'moon'],
  ['Ways of being', 'Samuel Reed', 'Nonfiction', 4.5, 'Thoughtful without being precious. I loved the connections between how we make things and how we make a life. Plenty to underline and return to.', '#d68265', '#5b2d31', 'arches'],
  ['Everything we carry', 'Maya Ellis', 'Memoir', 4, 'Tender, honest writing about the things we inherit and the things we choose to keep. The chapters about family recipes were my favorites.', '#dec9c4', '#683d48', 'flower'],
  ['The long way home', 'Oliver Finch', 'Fiction', 3.5, 'An unhurried journey with a very big heart. A few detours felt long, but the ending made them feel worthwhile.', '#8f9e77', '#263b32', 'path'],
  ['On making things', 'Ada Laurent', 'Design', 5, 'The book I want on my desk when I get stuck. Less about making something perfect, more about paying attention and beginning again.', '#e8ddc0', '#cc5a35', 'blocks'],
  ['A season of quiet', 'Isabel Hart', 'Essays', null, 'Still gathering my thoughts on this one. I especially loved the essay on returning to familiar places and finding them changed.', '#6e828c', '#f0e6cc', 'moon'],
];
export const demoBooks = samples.map(([title, author, genre, rating, review, color, ink, pattern], index) => ({ id: `demo-${index}`, title, author, genre, rating, review, color, ink, pattern, added: `2026-10-${String(16-index).padStart(2,'0')}`, favorite: [0, 1, 4, 6].includes(index), cover: null, url: null }));
