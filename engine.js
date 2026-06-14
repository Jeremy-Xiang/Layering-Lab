/* ============================================================
   THE LAYERING LAB — SCORING ENGINE + AFFILIATE CONFIG
   ============================================================ */

/* ---------- AFFILIATE CONFIG: edit these 3 tags after signup ---------- */
const AFFILIATE = {
  amazon:   { tag:'layeringlab-20',        label:'Amazon' },      // Amazon Associates
  jomashop: { aff:'YOURJOMOID',        label:'Jomashop' },    // via Rakuten/Sovrn deep link
  fragbuy:  { aff:'YOURFRAGNETID',     label:'FragranceX' }   // FragranceX/FragranceNet affiliate
};
/* Build a buy link for a given retailer. Falls back to plain search URL
   until you insert your real IDs (so the site works on day one). */
function buyLink(retailer, name){
  const q=encodeURIComponent(name);
  if(retailer==='amazon')
    return `https://www.amazon.com/s?k=${encodeURIComponent(name+' eau de parfum')}&tag=${AFFILIATE.amazon.tag}`;
  if(retailer==='jomashop')
    return `https://www.jomashop.com/search?q=${q}`;     // wrap with your Rakuten deep-link generator
  if(retailer==='fragbuy')
    return `https://www.fragrancex.com/search/search_results?stext=${q}`; // wrap with affiliate network link
  return `https://www.google.com/search?q=${q}`;
}

const FAM_COLOR={citrus:'--c-citrus',fresh:'--c-fresh',aromatic:'--c-aromatic',fruity:'--c-fruity',floral:'--c-floral',gourmand:'--c-gourmand',amber:'--c-amber',spicy:'--c-spicy',woody:'--c-woody',leather:'--c-leather',smoky:'--c-smoky',musky:'--c-musky',boozy:'--c-boozy',powdery:'--c-powdery'};

/* family affinity matrix (symmetric, default 50) */
const AFF={
 'gourmand|boozy':90,'gourmand|amber':85,'gourmand|leather':85,'gourmand|spicy':85,'gourmand|smoky':80,'gourmand|fruity':80,'gourmand|gourmand':75,'gourmand|musky':75,'gourmand|woody':70,'gourmand|floral':68,'gourmand|powdery':72,'gourmand|aromatic':65,'gourmand|fresh':62,'gourmand|citrus':60,
 'fresh|woody':85,'fresh|aromatic':85,'fresh|citrus':82,'fresh|musky':80,'fresh|fruity':75,'fresh|floral':70,'fresh|amber':62,'fresh|fresh':65,'fresh|spicy':58,'fresh|powdery':55,'fresh|boozy':50,'fresh|leather':45,'fresh|smoky':42,
 'citrus|aromatic':85,'citrus|woody':85,'citrus|musky':78,'citrus|fruity':75,'citrus|floral':72,'citrus|boozy':68,'citrus|citrus':65,'citrus|amber':62,'citrus|spicy':60,'citrus|powdery':58,'citrus|leather':50,'citrus|smoky':48,
 'woody|amber':85,'woody|spicy':85,'woody|musky':80,'woody|leather':80,'woody|smoky':80,'woody|aromatic':75,'woody|floral':72,'woody|fruity':70,'woody|boozy':70,'woody|powdery':68,'woody|woody':70,
 'amber|spicy':90,'amber|leather':85,'amber|boozy':85,'amber|smoky':80,'amber|powdery':75,'amber|floral':70,'amber|fruity':70,'amber|musky':70,'amber|amber':70,'amber|aromatic':65,
 'spicy|boozy':85,'spicy|leather':80,'spicy|smoky':80,'spicy|fruity':70,'spicy|aromatic':70,'spicy|floral':65,'spicy|spicy':65,'spicy|powdery':62,'spicy|musky':60,
 'leather|boozy':80,'leather|smoky':75,'leather|fruity':75,'leather|powdery':70,'leather|musky':65,'leather|floral':60,'leather|aromatic':60,'leather|leather':58,
 'smoky|boozy':80,'smoky|fruity':75,'smoky|aromatic':56,'smoky|musky':55,'smoky|powdery':52,'smoky|floral':50,'smoky|smoky':55,
 'fruity|floral':75,'fruity|musky':75,'fruity|boozy':75,'fruity|powdery':68,'fruity|aromatic':70,'fruity|fruity':65,
 'floral|musky':80,'floral|powdery':82,'floral|aromatic':70,'floral|floral':65,'floral|boozy':55,
 'musky|aromatic':75,'musky|powdery':75,'musky|musky':70,'musky|boozy':60,
 'aromatic|boozy':62,'aromatic|powdery':65,'aromatic|aromatic':65,
 'powdery|boozy':58,'powdery|powdery':62,
 'boozy|boozy':68
};
function aff(a,b){return AFF[a+'|'+b] ?? AFF[b+'|'+a] ?? 50}

/* hand-tested community classics: forced score + custom reasoning */
const CURATED={
 'br540|ol':{s:96,why:'The community-classic \u201Cleather Baccarat.\u201D Ombr\u00e9 Leather supplies the animalic depth BR540 famously lacks, while BR540\u2019s saffron-amberwood glow rounds the leather\u2019s edges. Smells like a $400 niche release.'},
 'br540|cloud':{s:95,why:'The most famous layering combo on the internet: Cloud shares BR540\u2019s sweet-musky DNA and adds a creamy coconut-praline cushion, multiplying projection while softening the sharp mineral edge.'},
 'lme|amorecaffe':{s:96,why:'Honeyed tobacco-vanilla over creamy coffee-vanilla \u2014 the shared vanilla base fuses them into one seamless dessert, with Elixir\u2019s lavender keeping it from going full bakery. A cold-weather compliment machine.'},
 'tv|oudwood':{s:94,why:'Two Tom Fords built to interlock: Oud Wood\u2019s dry, peppered woods give Tobacco Vanille a sophisticated backbone, and TV\u2019s cacao-vanilla sweetens the oud without cheapening it.'},
 'aventus|viw':{s:93,why:'Pineapple meets coconut-lime-rum \u2014 the tropical fruit bridge is obvious, but the real trick is Aventus\u2019s smoky birch grounding VIW so it reads \u201Cbeach house at dusk\u201D instead of \u201Csunscreen.\u201D'},
 'khamrah|amorecaffe':{s:93,why:'Spiced whiskey-date dessert plus creamy coffee \u2014 shared vanilla-praline DNA makes this seamless, and the coffee cuts Khamrah\u2019s syrup. Enormous performance for under $60 total.'},
 's33|tv':{s:91,why:'Santal 33\u2019s dry sandalwood-leather is the perfect ashtray-chic frame for Tobacco Vanille\u2019s sweetness \u2014 the combo reads like one expensive unisex tobacco-santal release.'},
 'sauvage|tv':{s:90,why:'\u201CSauvage Vanille\u201D \u2014 the ambroxan freshness lifts TV\u2019s density into something wearable in milder weather, while TV gives Sauvage the depth people accuse it of lacking.'},
 'layton|br540':{s:92,why:'Layton\u2019s apple-vanilla gourmand core shares the amber-sweet register of BR540; the result amplifies both into a glowing, regal sweetness with absurd longevity.'},
 'gs|br540':{s:93,why:'An intra-house MFK pairing: Grand Soir\u2019s benzoin-labdanum amber deepens BR540\u2019s mineral sweetness into full golden-hour mode. Kurkdjian has effectively endorsed layering his own lines.'},
 'eros|lme':{s:89,why:'Mint-vanilla meets honey-tobacco-vanilla: the shared vanilla-tonka base fuses them, Eros\u2019s mint top keeps the honey from cloying. Loud, youthful, dangerous in a club.'},
 'viw|lhomme':{s:88,why:'Coconut-lime rum over clean iris musk \u2014 L\u2019Homme acts like a freshly-ironed-shirt base layer that makes VIW read polished instead of vacation-only.'},
 'tv|tuscanleather':{s:92,why:'Raspberry-suede meets pipe-tobacco sweetness \u2014 two dense Tom Fords whose leather and tobacco share a smoky backbone, creating a decadent fruity-leather gourmand.'},
 'oudwood|rose31':{s:90,why:'Spiced masculine rose laid over smooth oud \u2014 the rose-oud pairing is a perfumery classic for a reason; here you build it yourself across two bottles.'},
 'aventus|tv':{s:89,why:'Smoky pineapple over tobacco-vanilla \u2014 Aventus\u2019s birch smoke and TV\u2019s tobacco share a dark thread, while the pineapple keeps it from getting heavy.'},
 'br540|delina':{s:90,why:'Lychee-rose femme over sweet amber \u2014 Delina\u2019s fruity rose sits beautifully on BR540\u2019s glowing base for a projective, elegant sweet-floral.'},
 'blackopium|cloud':{s:90,why:'Coffee-vanilla meets fluffy cream \u2014 Cloud\u2019s praline softens Black Opium\u2019s sharp coffee into a cozy gourmand that lasts all night.'},
 'sauvage|ol':{s:88,why:'Fresh-spicy ambroxan grounded by desert leather \u2014 Ombr\u00e9 Leather gives Sauvage a serious, expensive base without fighting its freshness up top.'},
 'lostcherry|tv':{s:90,why:'Boozy cherry-almond over tobacco-vanilla \u2014 the shared tonka-vanilla base and liqueur sweetness make this a rich, adult dessert combo.'},
 'khamrah|lme':{s:91,why:'Spiced-whiskey dates plus honeyed tobacco \u2014 a gourmand-spice powerhouse where both lean warm and ambery; performs for hours in the cold.'}
};
function curated(a,b){return CURATED[a+'|'+b]||CURATED[b+'|'+a]||null}

/* note -> family for chip coloring (covers all dataset notes; default musky) */
const NOTE_FAM={grapefruit:'citrus',lemon:'citrus',bergamot:'citrus',lime:'citrus',orange:'citrus',mandarin:'citrus','blood orange':'citrus','blood mandarin':'citrus',verbena:'citrus',
mint:'aromatic',lavender:'aromatic',sage:'aromatic',rosemary:'aromatic',geranium:'aromatic',licorice:'aromatic','star anise':'aromatic',juniper:'aromatic','bay leaf':'aromatic',galbanum:'aromatic','green tea':'aromatic',tea:'aromatic',
pineapple:'fruity',blackcurrant:'fruity',apple:'fruity','green apple':'fruity',pear:'fruity','smoky apple':'fruity',dates:'fruity','dried fruits':'fruity',coconut:'fruity',raspberry:'fruity','black cherry':'fruity',peach:'fruity',lychee:'fruity','passion fruit':'fruity',rhubarb:'fruity','tropical fruits':'fruity','fruity accord':'fruity',bellflower:'fruity',sapodilla:'fruity',
jasmine:'floral','jasmine sambac':'floral',rose:'floral','turkish rose':'floral',violet:'floral','violet leaf':'floral',iris:'floral',orris:'floral','orange blossom':'floral',neroli:'floral',tuberose:'floral',heliotrope:'floral','vanilla orchid':'floral',orchid:'floral',peony:'floral',magnolia:'floral',osmanthus:'floral','cherry blossom':'floral',
vanilla:'gourmand',honey:'gourmand',tonka:'gourmand',caramel:'gourmand',toffee:'gourmand',praline:'gourmand','whipped cream':'gourmand','bitter almond':'gourmand',almond:'gourmand','sugar cane':'gourmand',coffee:'gourmand',cacao:'gourmand',milk:'gourmand',coumarin:'gourmand',liqueur:'boozy',
saffron:'spicy',ginger:'spicy',nutmeg:'spicy',cinnamon:'spicy',cardamom:'spicy',pepper:'spicy','black pepper':'spicy','pink pepper':'spicy',cumin:'spicy',spices:'spicy',pimento:'spicy',
amber:'amber',amberwood:'amber',ambergris:'amber',benzoin:'amber',labdanum:'amber','fir resin':'amber',ambroxan:'amber',cashmeran:'amber',
cedar:'woody',sandalwood:'woody',vetiver:'woody',oakmoss:'woody',patchouli:'woody',woods:'woody','guaiac wood':'woody',guaiac:'woody',rosewood:'woody',oud:'woody',moss:'woody',papyrus:'woody',pine:'woody',bamboo:'woody',
leather:'leather',suede:'leather',birch:'smoky',incense:'smoky',tobacco:'smoky','tobacco leaf':'smoky',flint:'smoky',
musk:'musky','white musk':'musky','clean musk':'musky','mineral musk':'musky',ambrette:'musky',
'marine notes':'fresh','marine accord':'fresh',seaweed:'fresh',salt:'fresh','sea notes':'fresh',
'white rum':'boozy',rum:'boozy','red liquor accord':'boozy',cognac:'boozy',
'sichuan pepper':'spicy',coriander:'spicy',clove:'spicy',anise:'spicy',
'virginia cedar':'woody',cypress:'woody',myrrh:'woody','clary sage':'aromatic',basil:'aromatic',thyme:'aromatic',artemisia:'aromatic',
carnation:'floral',lotus:'floral',mimosa:'floral',hyacinth:'floral',freesia:'floral','lily of the valley':'floral',
tiare:'floral',narcissus:'floral',ylang:'floral',lily:'floral','water jasmine':'floral','ginger flower':'floral','almond milk':'gourmand',
melon:'fruity',quince:'fruity',fig:'fruity','fig leaf':'woody','green notes':'aromatic','green mandarin':'citrus',
truffle:'woody','black tea':'aromatic',plum:'fruity',dewberry:'fruity','red berries':'fruity','wild berries':'fruity',apricot:'fruity',
'petrol accord':'smoky',chocolate:'gourmand','salted vanilla':'gourmand','brown sugar':'gourmand',pistachio:'gourmand',marshmallow:'gourmand',date:'fruity',caraway:'spicy',
'cashmere wood':'woody',cashmere:'woody',opoponax:'amber',styrax:'amber','peru balsam':'amber',ambrox:'amber',
aldehydes:'powdery','coconut milk':'fruity',chestnut:'gourmand','sea salt':'fresh',driftwood:'woody',
pomegranate:'fruity',yuzu:'citrus',mahogany:'woody',blackberry:'fruity',cassis:'fruity','bitter orange':'citrus',blueberry:'fruity',civet:'musky',
cherry:'fruity','ginger lily':'floral',meringue:'gourmand','frozen rum accord':'boozy','watery notes':'fresh','aquatic notes':'fresh','atlas cedar':'woody','haitian vetiver':'woody',elemi:'woody','black currant':'fruity','coal accord':'smoky','metal accord':'smoky','chili pepper':'spicy','jasmine bud':'floral','roman chamomile':'aromatic',citron:'citrus',cedarwood:'woody',olibanum:'smoky',gardenia:'floral',
myrtle:'aromatic',hazelnut:'gourmand','crystal moss':'woody','coconut water':'fresh','may rose':'floral'};
function noteFam(n){return NOTE_FAM[n]||'musky'}

/* ---------- SCORING ---------- */
function scorePair(a,b){
  const cur=curated(a.id,b.id);

  /* --- family bridge analysis --- */
  let pairs=[];
  for(const fa of a.fam) for(const fb of b.fam) pairs.push(aff(fa,fb));
  pairs.sort((x,y)=>y-x);
  const best=pairs[0];                                   // single strongest bridge
  const second=pairs[1] ?? best;                         // backup bridge
  const worst=pairs[pairs.length-1];                     // weakest interaction
  const avg=pairs.reduce((t,v)=>t+v,0)/pairs.length;     // overall family fit
  const spread=best-worst;                               // how much the families disagree

  /* (A) base blend: anchor on the overall average family fit (so a pair has to
     be broadly compatible, not just have one lucky bridge), then let the
     strongest bridge lift and the weakest interaction bite. Centered lower
     than before so the full 0–100 range is actually used. */
  let s = avg*0.40 + best*0.30 + second*0.12 + worst*0.18;

  /* clash penalty: a hard incompatibility (marine vs heavy smoke) drags hard.
     A wide internal spread (some families love each other, others clash) is a
     "mixed signal" blend, so it loses points to clean, coherent pairs. */
  if(worst<50) s-=(50-worst)*1.1;
  if(spread>=25) s-=(spread-25)*0.22;
  /* elite-bridge reward, UNCAPPED so genuine standouts pull away from the pack
     instead of everyone piling onto the same ceiling number. Reserved for
     near-perfect primary bridges only. */
  if(best>=88) s+=(best-88)*0.7;

  /* (B) shared-note granularity: notes shared in the SAME tier (both tops,
     both bases) fuse far better than notes scattered across tiers. Weight
     base-shared highest (drydown is what lingers), then heart, then top.
     This breaks ties between pairs with identical family scores. */
  const tierShared=(la,lb)=>la.filter(n=>lb.includes(n));
  const topS  = tierShared(a.top,         b.top).length;
  const heartS= tierShared(a.heart||[],   b.heart||[]).length;
  const baseS = tierShared(a.base,        b.base).length;
  const aN=[...a.top,...(a.heart||[]),...a.base], bN=[...b.top,...(b.heart||[]),...b.base];
  const shared=aN.filter(n=>bN.includes(n));
  const crossShared=Math.max(0, shared.length-(topS+heartS+baseS)); // shared but different tiers
  s += Math.min(baseS*4 + heartS*3 + topS*2 + crossShared*1, 11);

  /* (C) tie-breakers / context ---------------------------------------- */
  // season alignment: same season window blends more believably; opposite
  // seasons (e.g. a Summer aquatic + a Winter tobacco) lose a touch
  if(a.season===b.season && a.season!=='Year-round') s+=2.5;
  else if(a.season==='Year-round' || b.season==='Year-round') s+=0.5;
  else s-=2.5;
  // gourmand/amber pairs are the most forgiving to layer in practice
  const sweet=f=>f.fam.some(x=>['gourmand','amber','boozy'].includes(x));
  if(sweet(a)&&sweet(b)) s+=1.5;
  // two very loud heavy fragrances can overwhelm — nudge down
  const heavyCount=f=>f.fam.filter(x=>['smoky','leather','boozy','amber','gourmand'].includes(x)).length;
  if(heavyCount(a)>=2 && heavyCount(b)>=2) s-=2.5;

  /* (D) variation stretch + de-clustering: expand each score's distance from a
     neutral pivot so results fan out across a wide band (no ceiling pinning a
     screen full of 88s). Then a small deterministic offset from average fit and
     the gap between the top two bridges gives nearly every distinct pair its
     own number, so the ranking is meaningful for research. The transform is
     pure math on the same inputs, so the same pair always yields the same score. */
  const PIVOT=64;
  s = PIVOT + (s-PIVOT)*1.18;
  s = s + (avg-70)*0.07 + (best-second)*0.05;

  s=Math.round(Math.max(25,Math.min(s,99)));
  if(cur) s=cur.s;                                       // curated classics override
  return {score:s,shared,cur};
}
function whyText(a,b,r){
  if(r.cur) return r.cur.why;
  const fp=[];
  for(const fa of a.fam) for(const fb of b.fam) fp.push([aff(fa,fb),fa,fb]);
  fp.sort((x,y)=>y[0]-x[0]);
  const [_,f1,f2]=fp[0];
  let t = f1===f2
    ? `Both lean <b>${f1}</b>, so they amplify rather than fight \u2014 expect a louder, deeper version of a profile you already like.`
    : `The core bridge is <b>${f1} \u00d7 ${f2}</b> \u2014 a pairing perfumers blend inside single compositions all the time, so your skin does the lab\u2019s job.`;
  if(r.shared.length) t+=` They also share <b>${r.shared.slice(0,3).join(', ')}</b>, fusing the two into one scent instead of two competing ones.`;
  return t;
}
function howText(a,b){
  const heavy=['gourmand','amber','leather','smoky','boozy'];
  const w=f=>f.fam.reduce((t,x)=>t+(heavy.includes(x)?1:0),0);
  const first=w(a)>=w(b)?a:b, second=first===a?b:a;
  return `Apply <b>${first.name}</b> first (heavier base), wait ~30 seconds, then 1\u20132 sprays of <b>${second.name}</b> over or beside it. Start 2:2 and adjust.`;
}
if(typeof module!=='undefined') module.exports={scorePair,whyText,howText,noteFam,FAM_COLOR,buyLink,AFFILIATE,CURATED};
