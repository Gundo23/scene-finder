const hosts: Record<string, string> = {
  manticore_spa_plymouth: 'manticorespa.com',
  dominium_vita_london: 'dominiumvita.com',
  chameleons_darlaston_darlaston: 'chameleons.cc',
  team_player_parties_surrey: 'teamplayerparties.co.uk',
}
export function isDatedCalendarVenue(id: string) { return Object.hasOwn(hosts, id) }
function text(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;|&#038;/gi, '&').replace(/\s+/g, ' ').trim()
}
const months = ['january','february','march','april','may','june','july','august','september','october','november','december']
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export function parseVenueDatedCalendar(html: string, venueId: string, pageUrl: string, today: string) {
  const out: {href:string;text:string;event_date:string;start_time:string|null;raw:string;image_url:null;method:string}[] = []
  let page: URL
  try { page = new URL(pageUrl) } catch { return out }
  if (page.protocol !== 'https:' || page.hostname.replace(/^www\./,'') !== hosts[venueId] || !/^20\d{2}-\d{2}-\d{2}$/.test(today)) return out
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,' ')
  const seen = new Set<string>()
  const add = (title:string, year:number, month:number, day:number, weekday:string, time:string|null, raw:string) => {
    const date = new Date(Date.UTC(year,month-1,day,12))
    if (!Number.isFinite(date.getTime()) || date.getUTCMonth() !== month-1 || date.getUTCDate() !== day || !days[date.getUTCDay()].toLowerCase().startsWith(weekday.toLowerCase())) return
    const iso = date.toISOString().slice(0,10), key = `${title}|${iso}`
    if (iso < today || !title || /\bcancell?ed\b/i.test(title) || seen.has(key)) return
    seen.add(key)
    out.push({href:pageUrl,text:title,event_date:iso,start_time:time,raw,image_url:null,method:'official-dated-calendar'})
  }
  if (venueId === 'dominium_vita_london') {
    if (page.pathname.replace(/\/$/, '') !== '/events' || !/Upcoming Events/i.test(text(clean))) return out
    const cards = [...clean.matchAll(/<div\b[^>]*class=["'][^"']*\bev_slider_link\b[^"']*["'][^>]*>/gi)]
    const year = Number(today.slice(0, 4))
    for (let index = 0; index < cards.length; index++) {
      const card = clean.slice(cards[index].index, cards[index + 1]?.index)
      const title = text(card.match(/<h[1-6]\b[^>]*class=["'][^"']*\bev_slider_heading\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || '')
      const dateText = text(card.match(/<i\b[^>]*class=["'][^"']*\bfa-calendar-range\b[^"']*["'][^>]*>[\s\S]*?<span\b[^>]*>([^<]+)<\/span>/i)?.[1] || '')
      const date = dateText.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(20\d{2}))?$/i)
      // Yearless cards must carry a current-year asset and a matching weekday.
      // Never promote a stale notice into the following year.
      const assetYear = card.match(/\/wp-content\/uploads\/(20\d{2})\//)?.[1]
      if (!date || (!date[4] && assetYear !== String(year))) continue
      const month = months.indexOf(date[3].toLowerCase()) + 1
      const raw = text(card.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ')).slice(0, 500)
      if (/\bIbiza\b/i.test(raw) || !title || title.length > 150) continue
      const before = out.length
      add(title, Number(date[4] || year), month, Number(date[2]), date[1], null, raw)
      const href = card.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
      if (out.length > before && href) {
        try {
          const url = new URL(href, pageUrl)
          if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
              ((url.hostname === 'dominiumvita.com' && url.pathname.startsWith('/latest-events/')) ||
               (url.hostname === 'themandrake.com' && url.pathname === '/event/ropes-and-beyond-london/'))) {
            out[out.length - 1].href = url.href
          }
        } catch { /* Keep the verified listing URL when a detail link is invalid. */ }
      }
    }
  } else if (venueId === 'chameleons_darlaston_darlaston') {
    if (!/^\/(?:darlaston-events)?\/?$/.test(page.pathname)) return out
    const cards = [...clean.matchAll(/<div\b[^>]*class=["']post_item["'][^>]*>/gi)]
    for (let i=0;i<cards.length;i++) {
      const card = clean.slice(cards[i].index,cards[i+1]?.index)
      const title = text(card.match(/<h3\b[^>]*class=["']post_title["'][^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '').replace(/\bbi sexual\b/gi,'Bisexual')
      const meta = text(card.match(/<p\b[^>]*class=["']post_meta["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '')
      const date = meta.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*([A-Z][a-z]{2})\s+(\d{1,2}),\s*(20\d{2})\b/)
      const month = date && months.findIndex(m=>m.startsWith(date[2].toLowerCase()))+1
      if (date && month) add(title,Number(date[4]),month,Number(date[3]),date[1],null,text(card).slice(0,400))
    }
  } else if (venueId === 'manticore_spa_plymouth') {
    if (page.pathname !== '/' || !/MANTICORE SPA/i.test(text(clean)) || !/Plymouth/i.test(text(clean))) return out
    const section = [...clean.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)].find(m=>/UPCOMING EVENTS/i.test(m[0]))?.[0]
    if (!section) return out
    const chunks = [...section.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi)]
    const year = Number(today.slice(0,4)), currentMonth = Number(today.slice(5,7))
    const anchored = [...text(section).matchAll(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)/gi)].some(d=>{
      const month=months.indexOf(d[3].toLowerCase())+1
      const date=new Date(Date.UTC(year,month-1,Number(d[2]),12))
      return month===currentMonth && date.getUTCMonth()===month-1 && date.getUTCDate()===Number(d[2]) && days[date.getUTCDay()].toLowerCase()===d[1].toLowerCase()
    })
    if (!anchored) return out
    for (let i=0;i<chunks.length;i++) {
      const title = text(chunks[i][1]), block = text(section.slice(chunks[i].index!+chunks[i][0].length,chunks[i+1]?.index))
      if (!title || /UPCOMING EVENTS/i.test(title)) continue
      const time = /\bMidday\b/i.test(block) ? '12:00' : block.match(/\b([1-9]|1[0-2])(?::([0-5]\d))?\s*(am|pm)\s*[-–]/i)
      const start = typeof time === 'string' ? time : time ? `${String(Number(time[1])%12+(time[3].toLowerCase()==='pm'?12:0)).padStart(2,'0')}:${time[2]||'00'}` : null
      for (const d of block.matchAll(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi)) {
        const month = months.indexOf(d[3].toLowerCase())+1
        // Yearless notices are accepted only in the current named month,
        // with a matching weekday; never roll a stale notice into next year.
        if (month === currentMonth) add(title,year,month,Number(d[2]),d[1],start,`${title}. ${block}`)
      }
      const weekly = block.match(/\b(?:Every\s+)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:s)?(?:\s+Afternoons)?\s+in\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i)
      if (weekly && months.indexOf(weekly[2].toLowerCase())+1 === currentMonth) {
        for(let day=1;day<=31;day++) if(days[new Date(Date.UTC(year,currentMonth-1,day,12)).getUTCDay()].toLowerCase()===weekly[1].toLowerCase()) add(title,year,currentMonth,day,weekly[1],start,`${title}. ${block}`)
      }
    }
  } else if (venueId === 'team_player_parties_surrey') {
    if (page.pathname.replace(/\/$/,'') !== '/party-calendar') return out
    const visible = text(clean), year = Number(visible.match(/\b(20\d{2}) Party Calendar\b/)?.[1])
    if (!year) return out
    for (const row of clean.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
      const raw=text(row[1]), d=raw.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+@\s+(.+)$/i)
      const month=d && months.indexOf(d[3].toLowerCase())+1
      if(d && month) add(`Team Player Party @ ${d[4]}`,year,month,Number(d[2]),d[1],null,`${year} Party Calendar. ${raw}`)
    }
  }
  return out
}
