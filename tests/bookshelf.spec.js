import {test,expect} from '@playwright/test';
const route='/prototypes/my-bookshelf/';
const mock=async(page,payload,status=200)=>page.route('**/api/bookshelf',r=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(payload)}));
test('sample shelf can be searched, filtered, sorted and read',async({page})=>{
 await mock(page,{mode:'demo'}); await page.goto(route);
 await expect(page.locator('article.book')).toHaveCount(8);
 await expect(page.getByText('Sample shelf',{exact:true})).toBeVisible();
 await page.getByRole('searchbox',{name:'Search books'}).fill('Clara');
 await expect(page.locator('article.book')).toHaveCount(1);
 await page.getByRole('searchbox',{name:'Search books'}).fill('');
 await page.getByRole('button',{name:'Fiction',exact:true}).click();
 await expect(page.locator('article.book')).toHaveCount(2);
 await page.getByRole('button',{name:'All books',exact:true}).click();
 await page.getByRole('button',{name:'Favorites',exact:false}).click();
 await expect(page.locator('article.book')).toHaveCount(4);
 await page.getByRole('button',{name:'Favorites',exact:false}).click();
 await page.getByLabel('Sort books').selectOption('title');
 await expect(page.locator('article.book h3').first()).toHaveText('A house by the sea');
 await page.locator('article.book summary').first().click();
 await expect(page.locator('article.book details[open]')).toHaveCount(1);
 await page.getByRole('searchbox',{name:'Search books'}).fill('no-matching-book');
 await expect(page.getByRole('heading',{name:'No books on this part of the shelf.'})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('article.book')).toHaveCount(8);
 await page.getByRole('button',{name:'Connect your bookshelf'}).click();
 await expect(page.getByRole('heading',{name:'Make this shelf yours.'})).toBeVisible();
});
test('live empty data and connection failure never silently show sample books',async({page})=>{
 await mock(page,{mode:'live',books:[],syncedAt:new Date().toISOString()});await page.goto(route);
 await expect(page.getByRole('heading',{name:'Your next chapter starts here.'})).toBeVisible();
 await page.unroute('**/api/bookshelf');await mock(page,{error:'Notion access denied.'},502);
 await page.getByRole('button',{name:'Refresh shelf'}).click();
 await expect(page.getByText('Notion access denied.')).toBeVisible();
 await expect(page.locator('article.book')).toHaveCount(0);
});
test('Notion text is escaped and broken covers fall back; full review remains available',async({page})=>{
 await mock(page,{mode:'live',syncedAt:new Date().toISOString(),books:[{id:'x',title:'<script>bad()</script>',author:'Someone',genre:'Essays',rating:0,review:'A long review. '.repeat(100),cover:'http://127.0.0.1:4174/missing-cover.jpg',url:'https://www.notion.so/test',added:'2026-01-01'}]});
 await page.goto(route);
 await expect(page.locator('article h3')).toHaveText('<script>bad()</script>');
 await expect(page.locator('.book-cover img')).toHaveCount(0);
 await expect(page.getByLabel('Rating: 0',{exact:true})).toBeVisible();
 await page.locator('summary').click();
 await expect(page.locator('details p')).toHaveText('A long review. '.repeat(100).trim());
});
test('mobile shelf fits viewport and keeps all controls accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mock(page,{mode:'demo'});await page.goto(route);
 await expect(page.locator('article.book')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await expect(page.getByLabel('Sort books')).toBeVisible();
 await page.getByRole('button',{name:'Notion setup'}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Close setup'}).click();
 await expect(page.getByRole('button',{name:'Notion setup'})).toBeFocused();
});

test('Add book saves all properties and displays the confirmed book',async({page})=>{
 let sent;let creates=0;
 await page.route('**/api/bookshelf',async route=>{
  if(route.request().method()==='POST'){
   creates++;sent=route.request().postDataJSON();
   await new Promise(resolve=>setTimeout(resolve,200));
   return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({book:{...sent,id:'new-book',added:new Date().toISOString(),url:null}})});
  }
  return route.fulfill({contentType:'application/json',body:JSON.stringify({mode:'live',books:[],genres:['Fiction','Poetry'],syncedAt:new Date().toISOString()})});
 });
 await page.goto(route);
 await page.getByRole('button',{name:'Add book',exact:true}).click();
 await expect(page.getByLabel('Title (required)')).toBeFocused();
 await expect(page.locator('#book-genre-options option')).toHaveCount(2);
 await page.getByLabel('Title (required)').fill('A new chapter');
 await page.getByLabel('Author (required)').fill('M. Reader');
 await page.getByLabel('Genre',{exact:true}).fill('Fiction');
 await page.getByLabel('Cover Image',{exact:true}).fill('https://example.com/cover.jpg');
 await page.getByLabel('Rating',{exact:true}).fill('4.25');
 await page.getByRole('checkbox',{name:'Favorite'}).check();
 await page.getByLabel('Review',{exact:true}).fill('Something worth remembering.');
 await page.getByRole('button',{name:'Save book',exact:true}).click();
 await expect(page.getByRole('button',{name:'Saving…'})).toBeDisabled();
 await expect(page.getByText('“A new chapter” was added to your bookshelf.')).toBeVisible();
 await expect(page.locator('article.book h3')).toHaveText('A new chapter');
 expect(sent).toEqual({title:'A new chapter',author:'M. Reader',genre:'Fiction',cover:'https://example.com/cover.jpg',rating:4.25,review:'Something worth remembering.',favorite:true});
 expect(creates).toBe(1);
 await page.getByRole('tab',{name:'Visualizations'}).click();
 await expect(page.locator('[data-stat=total]')).toHaveText('1');
 await expect(page.locator('[data-stat=average]')).toHaveText('4.25 1 rated');
 await expect(page.locator('[data-stat=favorites]')).toHaveText('1');
 await page.getByRole('button',{name:'Add book',exact:true}).click();
 await expect(page.getByLabel('Title (required)')).toHaveValue('');
 await expect(page.getByRole('checkbox',{name:'Favorite'})).not.toBeChecked();
});
test('save errors keep the draft and cancel preserves it on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 let creates=0;
 await page.route('**/api/bookshelf',route=>{
  if(route.request().method()==='POST'){creates++;return route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'Enable Insert content for your Notion connection.'})});}
  return route.fulfill({contentType:'application/json',body:JSON.stringify({mode:'demo'})});
 });
 await page.goto(route);
 await page.getByRole('button',{name:'Add book',exact:true}).click();
 await page.getByRole('button',{name:'Save book',exact:true}).click();
 expect(creates).toBe(0);
 await page.getByLabel('Title (required)').fill('Keep this draft');
 await page.getByLabel('Author (required)').fill('An author');
 await page.getByRole('button',{name:'Save book',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveText('Enable Insert content for your Notion connection.');
 await expect(page.getByLabel('Title (required)')).toHaveValue('Keep this draft');
 await expect(page.locator('article.book')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await expect(page.getByRole('button',{name:'Add book',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Add book',exact:true}).click();
 await expect(page.getByLabel('Title (required)')).toHaveValue('Keep this draft');
});

test('Visualizations use the whole shelf, expose books behind charts, and support keyboard tabs',async({page})=>{
 const books=[
  {id:'1',title:'First read',author:'Ada',genre:'Fiction',rating:0,review:'Thoughts'},
  {id:'2',title:'Second read',author:'Ada',genre:'Fiction',rating:4.5,review:''},
  {id:'3',title:'Third read',author:'Bea',genre:'Poetry',rating:null,review:''},
 ];
 await mock(page,{mode:'live',books,syncedAt:new Date().toISOString()});await page.goto(route);
 await page.getByRole('searchbox',{name:'Search books'}).fill('First read');
 await expect(page.locator('article.book')).toHaveCount(1);
 await page.getByRole('tab',{name:'Visualizations'}).click();
 await expect(page.getByRole('tabpanel',{name:'Visualizations'})).toBeVisible();
 await expect(page.locator('[data-stat=total]')).toHaveText('3');
 await expect(page.locator('[data-stat=average]')).toHaveText('2.25 2 rated');
 await expect(page.locator('[data-stat=reviewed]')).toHaveText('1of 3 reviewed');
 await page.getByRole('button',{name:'Rating 0: 1 book',exact:true}).click();
 await expect(page.locator('.insight-books li')).toHaveCount(1);
 await expect(page.locator('.insight-books')).toContainText('First read');
 await page.getByRole('button',{name:'Not rated: 1 book',exact:true}).click();
 await expect(page.locator('.insight-books')).toContainText('Third read');
 await page.getByRole('button',{name:'Clear selection'}).click();
 await expect(page.locator('.chart-detail')).toBeHidden();
 await page.getByRole('tab',{name:'Visualizations'}).focus();await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('tab',{name:/The collection/})).toBeFocused();
 await expect(page.getByRole('searchbox',{name:'Search books'})).toHaveValue('First read');
 await page.keyboard.press('End');
 await expect(page.getByRole('tab',{name:'Visualizations'})).toHaveAttribute('aria-selected','true');
 await page.goBack();
 await expect(page.getByRole('tabpanel',{name:/The collection/})).toBeVisible();
 await page.goForward();
 await page.reload();
 await expect(page.getByRole('tabpanel',{name:'Visualizations'})).toBeVisible();
});
test('Visualizations handle empty shelves and refresh their data',async({page})=>{
 let books=[];
 await page.route('**/api/bookshelf',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({mode:'live',books,syncedAt:new Date().toISOString()})}));
 await page.goto(`${route}#visualizations`);
 await expect(page.getByRole('heading',{name:'A reading portrait, waiting to happen.'})).toBeVisible();
 books=[{id:'one',title:'A new read',author:'Ada',genre:'Fiction',rating:null,review:''}];
 await page.getByRole('button',{name:'Refresh shelf'}).click();
 await expect(page.locator('[data-stat=total]')).toHaveText('1');
 await expect(page.locator('[data-stat=average]')).toHaveText('— 0 rated');
 await expect(page.getByText('Rate a book to start seeing your preferences.')).toBeVisible();
});
test('mobile charts fit, show sample context, and expand the full author list',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mock(page,{mode:'demo'});await page.goto(`${route}#visualizations`);
 await expect(page.getByRole('heading',{name:'A portrait of your shelf.'})).toBeVisible();
 await expect(page.locator('.insights-scope')).toContainText('Sample books');
 await expect(page.locator('.author-bars li:visible')).toHaveCount(5);
 await page.getByRole('button',{name:'Show all 8 authors'}).click();
 await expect(page.locator('.author-bars li:visible')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Add book',exact:true}).click();
 await expect(page.getByRole('tabpanel',{name:/The collection/})).toBeVisible();
 await expect(page.getByLabel('Title (required)')).toBeFocused();
});

test('Favorites filter and visualizations follow Notion checkboxes, including after refresh',async({page})=>{
 let books=[
  {id:'1',title:'High rating only',author:'Ada',genre:'Fiction',rating:5,favorite:false,review:''},
  {id:'2',title:'Personal favorite',author:'Bea',genre:'Fiction',rating:2,favorite:true,review:''},
  {id:'3',title:'Unrated favorite',author:'Cara',genre:'Poetry',rating:null,favorite:true,review:''},
 ];
 await page.route('**/api/bookshelf',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({mode:'live',books,syncedAt:new Date().toISOString()})}));
 await page.goto(route);
 await expect(page.locator('.favorite-badge')).toHaveCount(2);
 await page.getByRole('button',{name:'Favorites',exact:false}).click();
 await expect(page.locator('article.book')).toHaveCount(2);
 await expect(page.locator('article.book h3')).toHaveText(['Personal favorite','Unrated favorite']);
 await page.getByRole('button',{name:'Poetry',exact:true}).click();
 await expect(page.locator('article.book h3')).toHaveText(['Unrated favorite']);
 await page.getByRole('tab',{name:'Visualizations'}).click();
 await expect(page.locator('[data-stat=favorites]')).toHaveText('2');
 books=books.map(book=>({...book,favorite:false}));
 await page.getByRole('button',{name:'Refresh shelf'}).click();
 await expect(page.locator('[data-stat=favorites]')).toHaveText('0');
 await page.getByRole('tab',{name:/The collection/}).click();
 await expect(page.getByRole('heading',{name:'No books on this part of the shelf.'})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('article.book')).toHaveCount(3);
 await expect(page.locator('.favorite-badge')).toHaveCount(0);
});
