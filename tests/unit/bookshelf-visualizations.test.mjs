import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeBooks } from '../../prototypes/my-bookshelf/visualizations.js';

test('reading summaries include zero and fractional ratings, but exclude missing ratings from averages',()=>{
 const stats = summarizeBooks([
  {genre:'Fiction',author:'Ada',rating:0,review:'A thought'},
  {genre:'Fiction',author:'Ada',rating:4.5,review:' '},
  {genre:'Poetry',author:'Bea',rating:null},
  {genre:'Poetry',author:'Bea',rating:5},
  {genre:'Poetry',author:'Cara',rating:undefined},
 ]);
 assert.equal(stats.total,5);
 assert.equal(stats.ratedCount,3);
 assert.equal(stats.average,9.5/3);
 assert.equal(stats.reviewedCount,1);
 assert.deepEqual(stats.genres.map(g=>[g.name,g.count,g.ratedCount,g.average]),[['Poetry',3,1,5],['Fiction',2,2,2.25]]);
 assert.deepEqual(stats.ratings,[{value:0,count:1},{value:4.5,count:1},{value:5,count:1},{value:null,count:2}]);
 assert.deepEqual(stats.authors,[{name:'Ada',count:2},{name:'Bea',count:2},{name:'Cara',count:1}]);
});
test('empty and unrated collections produce no invented average or author',()=>{
 assert.equal(summarizeBooks([]).average,null);
 const stats=summarizeBooks([{author:'Unknown author',rating:null},{rating:NaN},{rating:'5'},{rating:Infinity}]);
 assert.equal(stats.average,null);assert.equal(stats.ratedCount,0);
 assert.equal(stats.genres[0].name,'Uncategorized');assert.equal(stats.genres[0].count,4);
 assert.deepEqual(stats.authors,[]);
 assert.deepEqual(stats.ratings,[{value:null,count:4}]);
});

test('favorite count uses only explicitly checked favorites',()=>{
 const stats=summarizeBooks([{rating:5,favorite:false},{rating:2,favorite:true},{rating:null,favorite:true},{rating:5}]);
 assert.equal(stats.favoriteCount,2);
 assert.equal(summarizeBooks([]).favoriteCount,0);
});
