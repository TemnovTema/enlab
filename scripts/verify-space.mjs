import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try {
 for(const width of [1440,390,320]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://localhost:3000');
  await page.getByRole('heading',{name:'Сегодня',exact:true}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Разделы английского',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  mkdirSync('test-results',{recursive:true});await page.screenshot({path:`test-results/today-space-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Timeline',exact:true}).click();
  assert.equal(await page.locator('#greece-detail').count(),0);
  const point=page.getByRole('button',{name:'Классическая Греция, V–IV века до н. э.',exact:true});
  await point.waitFor();
  assert.equal(await point.getAttribute('aria-expanded'),'false');
  const axis=await page.locator('.time-axis').boundingBox();
  assert.ok(axis.width>200 && axis.height<=2);
  await page.screenshot({path:`test-results/timeline-closed-${width}.png`,fullPage:true});
  await point.click();
  await page.getByRole('heading',{name:'Классическая Греция',exact:true}).waitFor();
  await page.getByText('Сократ, Платон, Аристотель:',{exact:false}).waitFor();
  await page.screenshot({path:`test-results/timeline-${width}.png`,fullPage:true});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#greece-detail').count(),0);
  await page.keyboard.press('Enter');
  await page.getByRole('heading',{name:'Классическая Греция',exact:true}).waitFor();
  await page.getByRole('button',{name:'Закрыть заметку',exact:true}).click();
  assert.equal(await page.locator('#greece-detail').count(),0);
  await page.getByRole('button',{name:'История России',exact:true}).click();
  await page.getByText('В направлении «История России» пока нет точек.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('heading',{name:'Классическая Греция',exact:true}).count(),0);
  await page.getByRole('button',{name:'Философия',exact:true}).click();
  await point.waitFor();
  assert.equal(await page.locator('#greece-detail').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Английский',exact:true}).click();
  await page.getByRole('heading',{name:/Маленькие шаги/}).waitFor();
  await page.getByRole('button',{name:'Тесты',exact:true}).click();
  await page.getByRole('button',{name:'Начать тест',exact:true}).first().waitFor();
  await page.getByRole('button',{name:'Сегодня',exact:true}).click();
  await page.getByRole('heading',{name:'Сегодня',exact:true}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Разделы английского',exact:true}).count(),0);
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: Today, Timeline outline, topic filters, English navigation, 1440/390/320px layouts.');
} finally {await browser.close();}
