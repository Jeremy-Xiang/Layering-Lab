#!/usr/bin/env node
/* ============================================================
   THE LAYERING LAB — BULK IMPORTER
   Converts a CSV of fragrances into the fragrances.js format.

   USAGE:
     node import-fragrances.js input.csv >> fragrances-new.js
     (then review, then replace the FRAGS array in fragrances.js)

   Or merge mode (keeps existing + adds new, dedupes by id):
     node import-fragrances.js input.csv --merge fragrances.js > merged.js

   CSV COLUMN FORMAT (header row required, order flexible):
     name,house,families,top,heart,base,season,vibe
   - families: pipe-separated, e.g. "gourmand|amber|spicy"
       valid: citrus fresh aromatic fruity floral gourmand amber
              spicy woody leather smoky musky boozy powdery
   - top/heart/base: pipe-separated notes, e.g. "saffron|jasmine"
   - season: one of  Year-round | Spring–Summer | Spring–Fall |
              Fall–Winter | Winter | Summer
   - vibe: short phrase, e.g. "sweet mineral glow"
   - id is auto-generated from name+house (no id column needed)

   EXAMPLE ROW:
     Baccarat Rouge 540,Maison Francis Kurkdjian,amber|gourmand|musky,saffron|jasmine,amberwood|ambergris,fir resin|cedar,Fall–Winter,sweet mineral glow

   WHERE TO GET DATA:
   - Fragrantica / Parfumo (note pyramids) — scrape or export
   - Keep the note vocabulary consistent; unknown notes default to the
     "musky" chip color but still score fine. To add a color, edit
     NOTE_FAM in engine.js.
   ============================================================ */

const fs=require('fs');

function slugId(name,house){
  return (name+' '+house).toLowerCase()
    .replace(/[^a-z0-9]+/g,'')
    .slice(0,24) || ('f'+Math.random().toString(36).slice(2,8));
}

/* minimal CSV parser handling quoted fields and commas inside quotes */
function parseCSV(text){
  const rows=[]; let row=[], field='', inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(inQ){
      if(c==='"'&&n==='"'){field+='"';i++}
      else if(c==='"'){inQ=false}
      else field+=c;
    } else {
      if(c==='"')inQ=true;
      else if(c===','){row.push(field);field=''}
      else if(c==='\n'){row.push(field);rows.push(row);row=[];field=''}
      else if(c==='\r'){/*skip*/}
      else field+=c;
    }
  }
  if(field.length||row.length){row.push(field);rows.push(row)}
  return rows.filter(r=>r.some(c=>c.trim()!==''));
}

function splitList(s){ return (s||'').split('|').map(x=>x.trim()).filter(Boolean); }

function toEntry(rec){
  const fam=splitList(rec.families);
  const top=splitList(rec.top), heart=splitList(rec.heart), base=splitList(rec.base);
  if(!rec.name||!rec.house||!fam.length||!top.length||!base.length){
    console.error('SKIP (missing required field):', rec.name||'(no name)');
    return null;
  }
  const e={
    id: slugId(rec.name,rec.house),
    name: rec.name.trim(),
    house: rec.house.trim(),
    fam, top,
    ...(heart.length?{heart}:{}),
    base,
    season: (rec.season||'Year-round').trim(),
    vibe: (rec.vibe||'').trim()
  };
  return e;
}

function serialize(e){
  const arr=a=>'['+a.map(x=>`'${x.replace(/'/g,"\\'")}'`).join(',')+']';
  let s=`{id:'${e.id}',name:'${e.name.replace(/'/g,"\\'")}',house:'${e.house.replace(/'/g,"\\'")}',fam:${arr(e.fam)},top:${arr(e.top)},`;
  if(e.heart) s+=`heart:${arr(e.heart)},`;
  s+=`base:${arr(e.base)},season:'${e.season}',vibe:'${e.vibe.replace(/'/g,"\\'")}'}`;
  return s;
}

/* --- main --- */
const args=process.argv.slice(2);
const csvPath=args[0];
const mergeIdx=args.indexOf('--merge');
if(!csvPath){ console.error('Usage: node import-fragrances.js input.csv [--merge fragrances.js]'); process.exit(1); }

const rows=parseCSV(fs.readFileSync(csvPath,'utf8'));
const header=rows[0].map(h=>h.trim().toLowerCase());
const records=rows.slice(1).map(r=>{
  const o={}; header.forEach((h,i)=>o[h]=r[i]||''); return o;
});

let entries=records.map(toEntry).filter(Boolean);

/* dedupe within import by id */
const seen=new Set(); entries=entries.filter(e=>{ if(seen.has(e.id))return false; seen.add(e.id); return true; });

if(mergeIdx!==-1){
  // merge with existing fragrances.js
  const existingPath=args[mergeIdx+1];
  const mod=require(require('path').resolve(existingPath));
  const existing=mod.FRAGS||[];
  const existingIds=new Set(existing.map(f=>f.id));
  const added=entries.filter(e=>!existingIds.has(e.id));
  const all=[...existing, ...added];
  console.error(`Existing: ${existing.length}, new added: ${added.length}, total: ${all.length}`);
  process.stdout.write('const FRAGS=[\n'+all.map(serialize).join(',\n')+'\n];\nif(typeof module!==\'undefined\') module.exports={FRAGS};\n');
} else {
  console.error(`Parsed ${entries.length} fragrances.`);
  process.stdout.write(entries.map(serialize).join(',\n')+'\n');
}
