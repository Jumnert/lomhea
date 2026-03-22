async function run(){
  const queries = {
    "Central Market": "Central Market Phnom Penh Cambodia",
    "Bamboo Train": "Norry Bamboo train Battambang Cambodia",
    "Kep Crab Market": "Kep Crab Market Cambodia"
  };
  for (const [name,q] of Object.entries(queries)) {
    const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetch(u,{headers:{'User-Agent':'lomhea/1.0'}});
    const data = await res.json();
    const pages = Object.values(data?.query?.pages||{});
    const urls = pages.map(p=>p?.imageinfo?.[0]?.url).filter(Boolean);
    console.log(name, urls[0]||'NONE');
  }
}
run();
