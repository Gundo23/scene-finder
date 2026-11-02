import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseVenueDatedCalendar as parse } from '../src/lib/venue-dated-calendars.ts'
const fixture = name => fs.readFileSync(new URL(`./fixtures/${name}-2026-11-02.html`,import.meta.url),'utf8')
test('Manticore extracts observed November dates and exact named-month weekly sessions',()=>{
  const html=fixture('manticore'), url='https://manticorespa.com/', id='manticore_spa_plymouth'
  const result=parse(html,id,url,'2026-11-02')
  assert.equal(result.length,13)
  assert.deepEqual(result.filter(e=>e.text==='T-GIRLS and ADMIRERS').map(e=>[e.event_date,e.start_time]),[['2026-11-03','12:00'],['2026-11-17','12:00']])
  assert.deepEqual(result.filter(e=>e.text==='BLACKOUT JOCKS').map(e=>[e.event_date,e.start_time]),[['2026-11-14','20:00']])
  assert.ok(result.filter(e=>e.text==='TOO BROKE TO POKE!').every(e=>e.start_time===null))
  assert.deepEqual(parse(html,id,url,'2026-12-02'),[])
  assert.deepEqual(parse(html,id,url,'2027-11-02'),[])
  assert.deepEqual(parse(html,id,'https://other.example/','2026-11-02'),[])
})
test('Darlaston binds dates to their own visible cards and retains existing title spelling',()=>{
  const html=fixture('darlaston'),id='chameleons_darlaston_darlaston',url='https://www.chameleons.cc/darlaston-events/'
  const events=parse(html,id,url,'2026-11-02')
  assert.equal(events.length,7)
  assert.equal(events[0].text,'Bisexual Halloween party')
  assert.deepEqual(events.filter(e=>/Masquerade/i.test(e.text)).map(e=>e.event_date),['2026-11-20','2026-11-21'])
  assert.ok(events.every(e=>e.start_time===null))
  assert.deepEqual(parse(html+html,id,url,'2026-11-02'),events)
  assert.deepEqual(parse(`<script>${html}</script>`,id,url,'2026-11-02'),[])
  assert.deepEqual(parse(html,id,'https://www.chameleons.cc/newport-events/','2026-11-02'),[])
})
test('Team Player uses only explicit dated annual rows, with the published host and unknown start',()=>{
  const html=fixture('team-player'),id='team_player_parties_surrey',url='https://teamplayerparties.co.uk/party-calendar'
  const events=parse(html,id,url,'2026-11-02')
  assert.equal(events.length,1)
  assert.equal(events[0].text,'Team Player Party @ PDI Lifestyle')
  assert.equal(events[0].event_date,'2026-12-04')
  assert.equal(events[0].start_time,null)
  assert.deepEqual(parse(html.replace('2026 Party Calendar','2025 Party Calendar'),id,url,'2026-11-02'),[])
  assert.deepEqual(parse('<p>First Friday every month</p>',id,url,'2026-11-02'),[])
})
test('deployment traces the PDF worker required by Route69',()=>{
  const config=fs.readFileSync(new URL('../next.config.ts',import.meta.url),'utf8')
  assert.ok(config.includes('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'))
  assert.ok(fs.existsSync(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',import.meta.url)))
})
