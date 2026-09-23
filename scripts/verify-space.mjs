import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try {
 for(const width of [1440,390,320]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://localhost:3000');
  await page.getByRole('heading',{name:/Ученье/}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Разделы английского',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  mkdirSync('test-results',{recursive:true});await page.screenshot({path:`test-results/today-space-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Timeline',exact:true}).click();
  await page.getByRole('heading',{name:'Классическая Греция',exact:true}).waitFor();
  await page.getByRole('button',{name:'Что здесь изучить',exact:true}).click();
  await page.getByText('Сократ, Платон, Аристотель:',{exact:false}).waitFor();
  await page.screenshot({path:`test-results/timeline-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'История России',exact:true}).click();
  await page.getByText('В направлении «История России» ещё нет точек.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('heading',{name:'Классическая Греция',exact:true}).count(),0);
  await page.getByRole('button',{name:'Философия',exact:true}).click();
  await page.getByRole('heading',{name:'Классическая Греция',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Английский',exact:true}).click();
  await page.getByRole('heading',{name:/Маленькие шаги/}).waitFor();
  await page.getByRole('button',{name:'Тесты',exact:true}).click();
  await page.getByRole('button',{name:'Начать тест',exact:true}).first().waitFor();
  await page.getByRole('button',{name:'Сегодня',exact:true}).click();
  await page.getByRole('heading',{name:/Ученье/}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Разделы английского',exact:true}).count(),0);
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: Today, Timeline outline, topic filters, English navigation, 1440/390/320px layouts.');
} finally {await browser.close();}
