import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookshelfService, normalizeBook, NOTION_VERSION } from '../../server/bookshelf.mjs';
const id = 'df38e553a9bb8287b35601ef2a9bd015';
const schema = { properties: Object.fromEntries(Object.entries({Title:'title',Author:'rich_text',Genre:'select','Cover Image':'files',Rating:'number',Review:'rich_text',Favorite:'checkbox'}).map(([name,type]) => [name,{type}])) };
const page = {object:'page',id:'one',properties:{Title:{title:[{plain_text:'A book'}]},Author:{rich_text:[{plain_text:'An author'}]},Genre:{select:{name:'Fiction'}},Rating:{number:0},Review:{rich_text:[{plain_text:'A '},{plain_text:'review'}]},'Cover Image':{files:[{file:{url:'https://example.com/cover.jpg'}}]}},url:'javascript:alert(1)'};
const json = value => new Response(JSON.stringify(value), {headers:{'Content-Type':'application/json'}});
test('unconfigured gallery explicitly reports demo without contacting Notion',async () => {
 assert.equal((await createBookshelfService({},()=>{throw Error('network called')})()).mode,'demo');
});
test('resolves a database, reads all pages with opaque cursors, pins current API and normalizes fields',async () => {
 const requests=[];
 const responses=[{data_sources:[{id}]},schema,{results:[page],has_more:true,next_cursor:'opaque / cursor : ?'}, {results:[{...page,id:'two'},{...page,id:'trash',in_trash:true}],has_more:false}];
 const load=createBookshelfService({NOTION_TOKEN:'test-private-token',NOTION_DATABASE_ID:id},async(url,options)=>{requests.push({url,...options});return json(responses.shift());});
 const result=await load();
 assert.equal(result.mode,'live'); assert.equal(result.books.length,2);
 assert.equal(result.books[0].rating,0); assert.equal(result.books[0].review,'A review'); assert.equal(result.books[0].url,null);
 assert.equal(requests[0].url,`https://api.notion.com/v1/databases/${id}`);
 assert.equal(requests[2].url,`https://api.notion.com/v1/data_sources/${id}/query`);
 assert.equal(JSON.parse(requests[3].body).start_cursor,'opaque / cursor : ?');
 assert.ok(requests.every(r=>r.headers['Notion-Version']===NOTION_VERSION));
 assert.ok(!JSON.stringify(result).includes('test-private-token'));
});
test('does not silently select one of several data sources',async()=>{
 await assert.rejects(createBookshelfService({NOTION_TOKEN:'test',NOTION_DATABASE_ID:id},async()=>json({data_sources:[{id},{id:'two'}]})),/multiple or no data sources/);
});
test('honors Retry-After and reports capped results',async()=>{
 const waits=[];let calls=0;
 const load=createBookshelfService({NOTION_TOKEN:'test',NOTION_DATA_SOURCE_ID:id},async()=>{
  calls++; if(calls===1)return new Response('',{status:429,headers:{'Retry-After':'2'}});
  return json(calls===2?schema:{results:[],has_more:false,request_status:{type:'incomplete'}});
 },async ms=>waits.push(ms));
 assert.match((await load()).warning,/10,000/);assert.deepEqual(waits,[2000]);
});
test('schema failures and denied access produce useful errors, never fake books',async()=>{
 await assert.rejects(createBookshelfService({NOTION_TOKEN:'test',NOTION_DATA_SOURCE_ID:id},async()=>json({properties:{}})),/Title.*Author.*Genre.*Cover Image.*Rating.*Review/);
 await assert.rejects(createBookshelfService({NOTION_TOKEN:'test',NOTION_DATA_SOURCE_ID:id},async()=>new Response('',{status:401})),/invalid or expired/);
});
test('missing fields, external covers, URL covers and fractional ratings are safe',()=>{
 assert.equal(normalizeBook({properties:{}}).rating,null);
 assert.equal(normalizeBook({properties:{'Cover Image':{url:'https://example.com/book.jpg'}}}).cover,'https://example.com/book.jpg');
 assert.equal(normalizeBook({properties:{'Cover Image':{files:[{external:{url:'https://example.com/external.jpg'}}]},Rating:{number:4.5}}}).rating,4.5);
 assert.equal(normalizeBook({properties:{'Cover Image':{url:'javascript:alert(1)'}}}).cover,null);
});

test('creates a book with a data-source parent and all seven properties, including long reviews', async () => {
 const calls = [];
 const review = 'A'.repeat(1999) + '🌻' + 'B'.repeat(2400);
 const load = createBookshelfService({NOTION_TOKEN:'private',NOTION_DATA_SOURCE_ID:id}, async(url, options) => {
  calls.push({url,...options});
  return json(calls.length === 1 ? schema : {...page,id:'new'});
 });
 const result = await load.addBook({title:' A book ',author:'An author',genre:'Fiction',cover:'https://example.com/cover.jpg',rating:0,review,favorite:true});
 assert.equal(result.book.id,'new');
 assert.equal(calls[1].url,'https://api.notion.com/v1/pages');
 const payload = JSON.parse(calls[1].body);
 assert.deepEqual(payload.parent,{type:'data_source_id',data_source_id:id});
 assert.equal(payload.properties.Title.title[0].text.content,'A book');
 assert.equal(payload.properties.Author.rich_text[0].text.content,'An author');
 assert.equal(payload.properties.Genre.select.name,'Fiction');
 assert.equal(payload.properties.Rating.number,0);
 assert.deepEqual(payload.properties.Favorite,{checkbox:true});
 assert.equal(payload.properties['Cover Image'].files[0].external.url,'https://example.com/cover.jpg');
 assert.ok(payload.properties.Review.rich_text.every(t=>t.text.content.length<=2000));
 assert.equal(payload.properties.Review.rich_text.map(t=>t.text.content).join(''),review);
});
test('supports URL property covers and blank optional properties',async()=>{
 let sent;
 const urlSchema=structuredClone(schema);urlSchema.properties['Cover Image'].type='url';
 const load=createBookshelfService({NOTION_TOKEN:'private',NOTION_DATA_SOURCE_ID:id},async(url,options)=>{
  if(url.endsWith('/pages')){sent=JSON.parse(options.body);return json(page);}return json(urlSchema);
 });
 await load.addBook({title:'Title',author:'Author'});
 assert.deepEqual(sent.properties['Cover Image'],{url:null});
 assert.deepEqual(sent.properties.Genre,{select:null});
 assert.deepEqual(sent.properties.Rating,{number:null});
 assert.deepEqual(sent.properties.Favorite,{checkbox:false});
 assert.deepEqual(sent.properties.Review,{rich_text:[]});
 await load.addBook({title:'Title',author:'Author',cover:'https://example.com/cover.png',rating:4.25});
 assert.equal(sent.properties['Cover Image'].url,'https://example.com/cover.png');
 assert.equal(sent.properties.Rating.number,4.25);
});
test('invalid submissions never call Notion',async()=>{
 let calls=0;
 const load=createBookshelfService({NOTION_TOKEN:'private',NOTION_DATA_SOURCE_ID:id},async()=>{calls++;return json(schema);});
 for(const input of [null,[],{}, {title:'T',author:'A',favorite:'true'}, {title:'T',author:'A',favorite:null}, {title:' ',author:'A'}, {title:'T',author:'A',cover:'javascript:alert(1)'}, {title:'T',author:'A',rating:'5'}, {title:'T',author:'A',rating:Infinity}, {title:'T',author:'A',review:'x'.repeat(10001)}, {title:'T',author:'A',genre:'Fiction,Poetry'}]) await assert.rejects(()=>load.addBook(input));
 assert.equal(calls,0);
 await assert.rejects(()=>createBookshelfService({}).addBook({title:'T',author:'A'}),/Connect your Notion database/);
});
test('write permission errors explain Insert content; uncertain saves are not retried',async()=>{
 let calls=0;
 const load=createBookshelfService({NOTION_TOKEN:'private',NOTION_DATA_SOURCE_ID:id},async url=>url.endsWith('/pages') ? new Response('',{status:403}) : json(schema));
 await assert.rejects(()=>load.addBook({title:'T',author:'A'}),/Insert content/);
 const uncertain=createBookshelfService({NOTION_TOKEN:'private',NOTION_DATA_SOURCE_ID:id},async url=>{
  if(url.endsWith('/pages')){calls++;throw Error('network');}return json(schema);
 });
 await assert.rejects(()=>uncertain.addBook({title:'T',author:'A'}),/Check your database before trying again/);
 assert.equal(calls,1);
});
test('HTTP route rejects cross-origin writes and malformed JSON',async()=>{
 const {createServer}=await import('node:http');
 const {bookshelfMiddleware}=await import('../../server/bookshelf.mjs');
 const middleware=bookshelfMiddleware({});
 const server=createServer((req,res)=>middleware(req,res,()=>{res.statusCode=404;res.end();}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const url=`http://127.0.0.1:${server.address().port}/api/bookshelf`;
  assert.equal((await fetch(url,{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'})).status,415);
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'T',author:'A'})})).status,503);
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(65537)})).status,413);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('Favorite maps the Notion checkbox independently of rating',()=>{
 assert.equal(normalizeBook({properties:{Rating:{number:5},Favorite:{checkbox:false}}}).favorite,false);
 assert.equal(normalizeBook({properties:{Rating:{number:null},Favorite:{checkbox:true}}}).favorite,true);
 assert.equal(normalizeBook({properties:{Rating:{number:5}}}).favorite,false);
});
